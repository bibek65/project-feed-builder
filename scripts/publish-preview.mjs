import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const bundleRoot = path.resolve(process.argv[2] ?? "preview-bundle");
const manifest = JSON.parse(await readFile(path.join(bundleRoot, "manifest.json"), "utf8"));
if (manifest.version !== 1) throw new Error("unsupported preview manifest version");
if (!manifest.renderer.startsWith("renderers/") || manifest.renderer.includes("..")) throw new Error("invalid renderer path");
if (!manifest.output.startsWith("generated/") || manifest.output.includes("..")) throw new Error("invalid output path");

const rendererPath = path.resolve(bundleRoot, manifest.renderer);
if (!rendererPath.startsWith(path.join(bundleRoot, "renderers") + path.sep)) throw new Error("renderer escaped bundle");
const outputPath = path.resolve(bundleRoot, manifest.output);
if (!outputPath.startsWith(path.join(bundleRoot, "generated") + path.sep)) throw new Error("output escaped bundle");

const projects = JSON.parse(await readFile(outputPath, "utf8"));
const renderer = await import(pathToFileURL(rendererPath).href);
if (typeof renderer.render !== "function") throw new Error("renderer must export render");
const rendered = await renderer.render({ ...projects, revision: process.env.GITHUB_SHA ?? "local" });
const digest = createHash("sha256").update(rendered).digest("hex").slice(0, 12);

if (process.env.DRY_RUN === "1") {
  console.log(`dry-run rendered ${rendered.length} bytes (${digest})`);
  process.exit(0);
}

const token = process.env.PORTFOLIO_SYNC_TOKEN;
if (!token) throw new Error("PORTFOLIO_SYNC_TOKEN is required outside dry-run mode");
const owner = "saurabbhattarai-lf";
const repo = "connected-private-site";
const filePath = "content/projects/generated.json";
const api = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
const headers = { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" };
const existing = await fetch(api, { headers });
const current = existing.ok ? await existing.json() : null;
const body = { message: "chore: synchronize generated project feed", content: Buffer.from(rendered).toString("base64"), branch: "main" };
if (current?.sha) body.sha = current.sha;
const response = await fetch(api, { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body) });
if (!response.ok) throw new Error(`portfolio synchronization failed: ${response.status}`);
console.log(`synchronized portfolio feed (${digest})`);
