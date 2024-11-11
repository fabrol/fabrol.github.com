/// <reference lib="deno.window" />
// build.ts
import { ensureDir, copy } from "https://deno.land/std@0.125.0/fs/mod.ts";
import {
  generateThoughtsHtml,
  generateThoughtPage,
  getAllThoughts,
} from "./thoughts.ts";

async function loadComponent(filePath: string): Promise<string> {
  return await Deno.readTextFile(filePath);
}

const DEBUG = Deno.args.includes("--debug");

async function buildPage(
  pageContentPath: string | { content: string },
  outputFilePath: string,
  nav: string,
  footer: string,
  head: string,
  title: string
) {
  if (DEBUG) {
    console.log("\n=== Debug Info ===");
    console.log("Loading from:", pageContentPath);
  }

  const layout = await loadComponent("src/templates/layout.html");

  // Handle either raw content or file path
  const pageContent =
    typeof pageContentPath === "string"
      ? await loadComponent(pageContentPath)
      : pageContentPath.content;

  if (DEBUG) {
    console.log("Layout template:", layout);
    console.log("Page content:", pageContent);
  }

  let page = layout
    .replace("{{ nav }}", nav)
    .replace("{{ footer }}", footer)
    .replace("{{ head }}", head)
    .replace("{{ content }}", pageContent);

  page = page.replace("{{ title }}", title);

  if (DEBUG) {
    console.log("Final page content:", page);
    console.log("Writing to:", outputFilePath);
    console.log("================\n");
  }

  await ensureDir("dist");
  await Deno.writeTextFile(outputFilePath, page);
}

async function copyAssets() {
  await ensureDir("dist/assets/css");
  await copy("src/assets/css/styles.css", "dist/assets/css/styles.css", {
    overwrite: true,
  });

  await ensureDir("dist/assets/images");
  for await (const file of Deno.readDir("src/assets/images")) {
    if (file.isFile) {
      await copy(
        `src/assets/images/${file.name}`,
        `dist/assets/images/${file.name}`,
        { overwrite: true }
      );
    }
  }
}

async function main() {
  const nav = await loadComponent("src/components/nav.html");
  const footer = await loadComponent("src/components/footer.html");
  const head = await loadComponent("src/components/head.html");

  // Build individual thought pages
  const thoughts = await getAllThoughts();
  await ensureDir("dist/thoughts");

  for (const thought of thoughts) {
    const thoughtContent = await generateThoughtPage(thought);
    await buildPage(
      { content: thoughtContent },
      `dist/thoughts/${thought.slug}.html`,
      nav,
      footer,
      head,
      `${thought.title} - Farhan Abrol`
    );
  }

  // Build each page, specifying the title for each
  await buildPage(
    "src/content/index.html",
    "dist/index.html",
    nav,
    footer,
    head,
    "Home - Farhan Abrol"
  );
  await buildPage(
    "src/content/about.html",
    "dist/about.html",
    nav,
    footer,
    head,
    "About - Farhan Abrol"
  );

  const thoughtsContent = await generateThoughtsHtml();
  await buildPage(
    { content: thoughtsContent },
    "dist/thoughts.html",
    nav,
    footer,
    head,
    "Thoughts - Farhan Abrol"
  );
  // Copy CSS and images
  await copyAssets();
}

main();
