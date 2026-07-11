import type { ProjectManifest } from "./schema.js";

export interface ProjectFeed {
  generatedAt: string;
  projects: ProjectManifest[];
}

export function renderFeed(projects: ProjectManifest[], now = new Date()): ProjectFeed {
  return { generatedAt: now.toISOString(), projects };
}
