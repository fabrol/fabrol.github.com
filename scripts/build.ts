/// <reference lib="deno.window" />
// build.ts
import { ensureDir, copy } from "https://deno.land/std@0.125.0/fs/mod.ts";
import {
  generateThoughtsHtml,
  generateThoughtPage,
  getAllThoughts,
} from "./thoughts.ts";
import { type Project, projects } from "../src/data/projects.ts";

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
  // Copy CSS
  await ensureDir("dist/assets/css");
  await copy("src/assets/css/styles.css", "dist/assets/css/styles.css", {
    overwrite: true,
  });

  // Copy images
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

  // Create CNAME file
  await Deno.writeTextFile("dist/CNAME", "farhanabrol.com");
}

function generateProjectCard(project: Project): string {
  return `
    <div class="project-card" onclick="window.location='/projects/${
      project.slug
    }.html'">
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="project-meta">
        ${project.technologies
          ?.map((tech) => `<span class="tech-tag">${tech}</span>`)
          .join("")}
      </div>
      <div class="project-links">
        ${
          project.url
            ? `<a href="${project.url}" onclick="event.stopPropagation()" target="_blank">View Project</a>`
            : ""
        }
        ${
          project.github
            ? `<a href="${project.github}" onclick="event.stopPropagation()" target="_blank">Source Code</a>`
            : ""
        }
      </div>
    </div>
  `;
}

async function buildProjects(nav: string, footer: string, head: string) {
  // Build projects list page
  const projectsHtml = projects.map(generateProjectCard).join("\n");

  // Ensure projects directory exists
  await ensureDir("dist/projects");

  // Build individual project pages
  for (const project of projects) {
    try {
      const projectContent = await loadComponent(
        `src/content/projects/${project.slug}.html`
      );
      await buildPage(
        { content: projectContent },
        `dist/projects/${project.slug}.html`,
        nav,
        footer,
        head,
        `${project.title} - Projects - Farhan Abrol`
      );
    } catch (e) {
      console.warn(`No custom page found for project: ${project.slug}`);
    }
  }

  return projectsHtml;
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
  await buildPage(
    "src/content/now.html",
    "dist/now.html",
    nav,
    footer,
    head,
    "Now - Farhan Abrol"
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

  const projectsContent = await buildProjects(nav, footer, head);
  await buildPage(
    { content: projectsContent },
    "dist/projects.html",
    nav,
    footer,
    head,
    "Projects - Farhan Abrol"
  );
}

main();
