export interface ProjectManifest {
  name: string;
  slug: string;
  summary: string;
  repository: string;
  topics: string[];
}

export function validateProject(value: unknown, source: string): ProjectManifest {
  if (!value || typeof value !== "object") throw new Error(`${source}: expected an object`);
  const project = value as Record<string, unknown>;
  if (typeof project.name !== "string" || typeof project.slug !== "string") throw new Error(`${source}: name and slug are required`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) throw new Error(`${source}: invalid slug`);
  if (typeof project.summary !== "string" || typeof project.repository !== "string") throw new Error(`${source}: summary and repository are required`);
  if (!project.repository.startsWith("https://github.com/")) throw new Error(`${source}: repository must use GitHub HTTPS`);
  if (!Array.isArray(project.topics) || project.topics.some((topic) => typeof topic !== "string")) throw new Error(`${source}: topics must be strings`);
  return { name: project.name, slug: project.slug, summary: project.summary, repository: project.repository, topics: project.topics };
}
