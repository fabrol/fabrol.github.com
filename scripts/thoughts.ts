import { walk } from "https://deno.land/std/fs/mod.ts";
import { parse as parseYaml } from "https://deno.land/std/yaml/mod.ts";

interface Thought {
  date: Date;
  title: string;
  content: string;
  slug: string;
  tags?: string[];
  socialLinks?: {
    twitter?: string;
    bluesky?: string;
  };
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

  return `
    <div class="thought-entry">
      <h2>${thought.title}</h2>
      <div class="thought-date">${thought.date.toLocaleDateString()}</div>
      <div class="thought-content">${thought.content}</div>
      ${socialLinksHtml}
    </div>
  `;
}

export async function getAllThoughts(): Promise<Thought[]> {
  const thoughts: Thought[] = [];

  for await (const entry of walk("src/content/thoughts", {
    match: [/\.md$/],
    includeDirs: false,
  })) {
    const content = await Deno.readTextFile(entry.path);
    const [frontmatter, ...contentParts] = content
      .split("---\n")
      .filter(Boolean);
    const metadata = parseYaml(frontmatter) as Thought;

    thoughts.push({
      date: new Date(metadata.date),
      title: metadata.title,
      content: contentParts.join("---\n"),
      slug: entry.name,
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
      <h1>Thoughts</h1>
      <div class="thoughts-list">
        ${thoughtsHtml}
      </div>
    </div>
  `;
}
