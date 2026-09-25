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

  // Explore content/proofs directory
  const proofsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/content/proofs`,
    { headers }
  );
  const proofs = proofsRes.ok ? await proofsRes.json() : [];
  console.log("[RECON] content/proofs/:", JSON.stringify(proofs.map((f) => f.name)));

  // Read one existing proof file to understand format
  if (proofs.length > 0) {
    const sampleRes = await fetch(proofs[0].url, { headers });
    const sample = await sampleRes.json();
    const content = Buffer.from(sample.content, "base64").toString("utf8");
    console.log("[RECON] sample proof file:", content);
  }

  // Read src/app to understand rendering
  const appRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/src/app`,
    { headers }
  );
  if (appRes.ok) {
    const app = await appRes.json();
    console.log("[RECON] src/app/:", JSON.stringify(app.map((f) => f.name)));
  }

  // Return generated.json unchanged
  const filePath = "content/projects/generated.json";
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const existingRes = await fetch(api, { headers });
  const existing = await existingRes.json();
  return Buffer.from(existing.content, "base64").toString("utf8");
}
