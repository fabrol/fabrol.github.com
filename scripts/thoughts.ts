import { walk } from "https://deno.land/std/fs/mod.ts";
import { parse as parseYaml } from "https://deno.land/std/yaml/mod.ts";
import { marked } from "npm:marked";

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
  socialLinks?: {
    twitter?: string;
    bluesky?: string;
  };
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

  const preview = getPreview(thought.content);

  return `
    <div class="thought-entry">
      <div class="thought-header">
        <a href="/thoughts/${thought.slug}.html" class="thought-title">${
    thought.title
  }</a>
        <span class="thought-date">${thought.date.toLocaleDateString()}</span>
      </div>
      <a href="/thoughts/${
        thought.slug
      }.html" class="thought-preview">${preview}</a>
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
      socialLinks: metadata.socialLinks,
    });
  }

  return thoughts.sort((a, b) => b.date.getTime() - a.date.getTime());
}
export async function generateThoughtsHtml(): Promise<string> {
  const thoughts = await getAllThoughts();
  const thoughtsHtml = thoughts.map(thoughtToHtml).join("\n");

  return `
    <div class="thoughts">
      {{ email_signup }}
      <div class="thoughts-list">
        ${thoughtsHtml}
      </div>
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

  return `
    <div class="thought-single">
      <h1>${thought.title}</h1>
      <div class="thought-date">${thought.date.toLocaleDateString()}</div>
      <div class="thought-content">${thought.content}</div>
      ${socialLinksHtml}
      {{ email_signup }}
    </div>
  `;
}
