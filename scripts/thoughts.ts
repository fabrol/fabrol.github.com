import { walk } from "https://deno.land/std/fs/mod.ts";
import { parse as parseYaml } from "https://deno.land/std/yaml/mod.ts";
import { marked } from "npm:marked";
import { projects } from "../src/data/projects.ts";
import { generateProjectCard } from "./projects.ts";

// Configure marked options
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
});

interface Thought {
  date: Date;
  title: string;
  content: string;
  slug: string;
  draft: boolean;
  projectSlug?: string;
  socialLinks?: {
    twitter?: string;
    bluesky?: string;
  };
  tags?: string[];
}

function getPreview(content: string, length = 150): string {
  return (
    content.trim().split("\n")[0].slice(0, length) +
    (content.length > length ? "..." : "")
  );
}

function thoughtToHtml(thought: Thought): string {
  const socialLinks = [];
  if (thought.socialLinks?.twitter) {
    socialLinks.push(
      `<a href="${thought.socialLinks.twitter}" target="_blank">View on Twitter ↗</a>`
    );
  }
  if (thought.socialLinks?.bluesky) {
    socialLinks.push(
      `<a href="${thought.socialLinks.bluesky}" target="_blank">View on Bluesky ↗</a>`
    );
  }

  const socialLinksHtml = socialLinks.length
    ? `<div class="thought-links">${socialLinks.join(" • ")}</div>`
    : "";

  const tagsHtml = thought.tags?.length
    ? `<div class="thought-tags">${thought.tags
        .map((tag) => `<span class="tag">${tag}</span>`)
        .join("")}</div>`
    : "";

  const preview = getPreview(thought.content);

  return `
    <div class="thought-entry" onclick="window.location.href='/thoughts/${
      thought.slug
    }.html'" style="cursor: pointer;">
      <div class="thought-header">
        <span class="thought-title">${thought.title}</span>
        <span class="thought-date">${thought.date.toLocaleDateString()}</span>
      </div>
      <div class="thought-preview">${preview}</div>
      ${tagsHtml}
      ${socialLinksHtml}
    </div>
  `;
}

export async function getAllThoughts(): Promise<Thought[]> {
  const thoughts: Thought[] = [];

  for await (const entry of walk("src/content/thoughts", {
    match: [/\.md$/],
  })) {
    const content = await Deno.readTextFile(entry.path);
    const [frontmatter, ...contentParts] = content
      .split("---\n")
      .filter(Boolean);
    const metadata = parseYaml(frontmatter) as Thought;

    if (metadata.draft) {
      continue;
    }

    const markdownContent = contentParts.join("---\n");
    const htmlContent = await marked(markdownContent);

    thoughts.push({
      date: new Date(metadata.date),
      title: metadata.title,
      content: htmlContent,
      slug: metadata.slug,
      draft: metadata.draft,
      projectSlug: metadata.projectSlug,
      socialLinks: metadata.socialLinks,
      tags: metadata.tags || [],
    });
  }

  return thoughts.sort((a, b) => b.date.getTime() - a.date.getTime());
}
export async function generateThoughtsHtml(): Promise<string> {
  const thoughts = await getAllThoughts();
  const thoughtsHtml = thoughts.map(thoughtToHtml).join("\n");

  return `
    <div class="thoughts">
      <div class="thoughts-list">
        ${thoughtsHtml}
      </div>
      {{ email_signup }}
    </div>
  `;
}

export function generateThoughtPage(thought: Thought): string {
  const socialLinks = [];
  if (thought.socialLinks?.twitter) {
    socialLinks.push(
      `<a href="${thought.socialLinks.twitter}" target="_blank">View on Twitter ↗</a>`
    );
  }
  if (thought.socialLinks?.bluesky) {
    socialLinks.push(
      `<a href="${thought.socialLinks.bluesky}" target="_blank">View on Bluesky ↗</a>`
    );
  }

  const socialLinksHtml = socialLinks.length
    ? `<div class="thought-links">${socialLinks.join(" • ")}</div>`
    : "";

  const tagsHtml = thought.tags?.length
    ? `<div class="thought-tags">${thought.tags
        .map((tag) => `<span class="tag">${tag}</span>`)
        .join("")}</div>`
    : "";

  // Find linked project
  const linkedProject = thought.projectSlug
    ? projects.find((p) => p.slug === thought.projectSlug)
    : null;
  const projectCardHtml = linkedProject
    ? `
    <div class="related-project">
      <h3>Relevant Project</h3>
      ${generateProjectCard(linkedProject)}
    </div>
  `
    : "";

  return `
    <div class="thought-single">
      <h1>${thought.title}</h1>
      <div class="thought-header">
        <div class="thought-date">${thought.date.toLocaleDateString()}</div>
        ${tagsHtml}
      </div>
      <div class="thought-content">${thought.content}</div>
      ${socialLinksHtml}
      ${projectCardHtml}
      {{ email_signup }}
    </div>
  `;
}
