export async function render(context) {
  return JSON.stringify({
    generatedAt: context.generatedAt,
    projects: context.projects
  }, null, 2) + "\n";
}
