import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const bundle = path.join(root, "preview-bundle");
await mkdir(path.join(bundle, "renderers"), { recursive: true });
await mkdir(path.join(bundle, "generated"), { recursive: true });
await cp(path.join(root, "preview", "manifest.json"), path.join(bundle, "manifest.json"));
await cp(path.join(root, "preview", "renderers", "default.mjs"), path.join(bundle, "renderers", "default.mjs"));
await cp(path.join(root, "dist", "projects.json"), path.join(bundle, "generated", "projects.json"));
console.log(`prepared preview bundle at ${bundle}`);
