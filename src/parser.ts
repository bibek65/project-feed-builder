import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { validateProject, type ProjectManifest } from "./schema.js";

export async function loadProjects(directory: string): Promise<ProjectManifest[]> {
  const files = (await readdir(directory)).filter((file) => file.endsWith(".yaml") || file.endsWith(".yml")).sort();
  const projects = await Promise.all(files.map(async (file) => {
    const source = path.join(directory, file);
    return validateProject(parse(await readFile(source, "utf8")), file);
  }));
  const slugs = new Set<string>();
  for (const project of projects) {
    if (slugs.has(project.slug)) throw new Error(`duplicate project slug: ${project.slug}`);
    slugs.add(project.slug);
  }
  return projects;
}
