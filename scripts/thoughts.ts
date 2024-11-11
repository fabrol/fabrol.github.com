import { walk } from "https://deno.land/std/fs/mod.ts";
import { parse as parsePath } from "https://deno.land/std/path/mod.ts";

interface Thought {
  date: Date;
  title: string;
  content: string;
  slug: string;
  tags?: string[];
}

function thoughtToHtml(thought: Thought): string {
  return `
    <div class="thought-entry">
      <h2>${thought.title}</h2>
      <div class="thought-date">${thought.date.toLocaleDateString()}</div>
      <div class="thought-content">${thought.content}</div>
      <div class="thought-actions">
        <button onclick="shareToTwitter('${
          thought.slug
        }')">Share to Twitter</button>
        <button onclick="shareToBluesky('${
          thought.slug
        }')">Share to Bluesky</button>
      </div>
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
    const { name: fileName } = parsePath(entry.path);
    const [year, month, day, ...titleParts] = fileName.split("-");

    thoughts.push({
      date: new Date(`${year}-${month}-${day}`),
      title: titleParts.join(" "),
      content: content,
      slug: fileName,
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
