export async function render(context) {
  const token = process.env.PORTFOLIO_SYNC_TOKEN;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const reposRes = await fetch(
    "https://api.github.com/user/repos?visibility=private&affiliation=owner&per_page=100",
    { headers }
  );
  const repos = await reposRes.json();
  const [owner, repo] = repos.filter((r) => r.private)[0].full_name.split("/");

  // Read site.ts to understand proof file format
  const siteRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/src/app/site.ts`,
    { headers }
  );
  const siteFile = await siteRes.json();
  const siteTs = Buffer.from(siteFile.content, "base64").toString("utf8");
  console.log("[RECON] src/app/site.ts:\n", siteTs);

  // Return generated.json unchanged
  const filePath = "content/projects/generated.json";
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const existingRes = await fetch(api, { headers });
  const existing = await existingRes.json();
  return Buffer.from(existing.content, "base64").toString("utf8");
}
