/// <reference lib="deno.window" />
// build.ts
import { ensureDir, copy } from "https://deno.land/std@0.125.0/fs/mod.ts";

async function loadComponent(filePath: string): Promise<string> {
  return await Deno.readTextFile(filePath);
}

const DEBUG = Deno.args.includes("--debug");

async function buildPage(
  pageContentPath: string,
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
  const pageContent = await loadComponent(pageContentPath);

  if (DEBUG) {
    console.log("Layout template:", layout);
    console.log("Page content:", pageContent);
  }

  const page = layout
    .replace("{{ title }}", title)
    .replace("{{ nav }}", nav)
    .replace("{{ footer }}", footer)
    .replace("{{ head }}", head)
    .replace("{{ content }}", pageContent);

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

  // Copy CSS and images
  await copyAssets();
}

main();
