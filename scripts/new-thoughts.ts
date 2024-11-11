#!/usr/bin/env -S deno run --allow-write
import { join } from "https://deno.land/std/path/mod.ts";

async function createNewThought() {
  const date = new Date().toISOString().split("T")[0];
  const title = Deno.args[0] || "untitled-thought";
  const fileName = `${date}-${title.toLowerCase().replace(/\s+/g, "-")}.md`;
  const filePath = join("src/content/thoughts", fileName);

  await Deno.writeTextFile(filePath, "");
  console.log(`Created new thought: ${filePath}`);
}

if (import.meta.main) {
  createNewThought();
}
