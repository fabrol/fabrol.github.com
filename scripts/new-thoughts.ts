#!/usr/bin/env -S deno run --allow-write
import { join } from "https://deno.land/std/path/mod.ts";
import { stringify as yamlStringify } from "https://deno.land/std/yaml/mod.ts";

interface ThoughtFrontmatter {
  title: string;
  date: string;
  draft: boolean;
  slug: string;
  socialLinks?: {
    twitter?: string;
    bluesky?: string;
  };
}

async function createNewThought() {
  const date = new Date().toISOString().split("T")[0];
  const title = Deno.args[0] || "untitled-thought";
  const fileName = `${date}-${title.toLowerCase().replace(/\s+/g, "-")}.md`;
  const filePath = join("src/content/thoughts", fileName);

  const frontmatter = yamlStringify({
    title,
    date,
    draft: true,
    slug: title.toLowerCase().replace(/\s+/g, "-"),
    socialLinks: {},
  });

  const fullContent = `---\n${frontmatter}---\n\nEnter your thought here.`;
  await Deno.writeTextFile(filePath, fullContent);
  console.log(`\nCreated new thought: ${filePath}`);
}

if (import.meta.main) {
  createNewThought();
}
