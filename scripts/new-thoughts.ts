#!/usr/bin/env -S deno run --allow-write --allow-net --allow-env
import { join } from "https://deno.land/std/path/mod.ts";
import {
  parse as parseYaml,
  stringify as yamlStringify,
} from "https://deno.land/std/yaml/mod.ts";
import { BskyAgent } from "npm:@atproto/api";

interface SocialConfig {
  twitter?: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  };
  bluesky?: {
    handle: string;
    password: string;
  };
}

async function postToBluesky(
  text: string,
  config: SocialConfig
): Promise<string | null> {
  if (!config.bluesky) return null;

  const agent = new BskyAgent({ service: "https://bsky.social" });
  await agent.login({
    identifier: config.bluesky.handle,
    password: config.bluesky.password,
  });

  const response = await agent.post({ text });
  return `https://bsky.app/profile/${config.bluesky.handle}/post/${response.uri
    .split("/")
    .pop()}`;
}

async function postToTwitter(
  text: string,
  config: SocialConfig
): Promise<string | null> {
  if (!config.twitter) return null;

  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.twitter.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();
  return `https://twitter.com/status/${data.data.id}`;
}

function generateSocialUrls(text: string) {
  const encodedText = encodeURIComponent(text);
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
    bluesky: `https://bsky.app/intent/compose?text=${encodedText}`,
  };
}

async function openInBrowser(url: string) {
  const cmd = Deno.build.os === "windows" ? ["cmd", "/c", "start"] : ["open"];
  const process = Deno.run({
    cmd: [...cmd, url],
  });
  await process.status();
}

async function waitForUrl(platform: string): Promise<string | null> {
  console.log(
    `\nAfter posting on ${platform}, paste the URL (or press Enter to skip):`
  );
  const url = prompt("> ");
  return url?.trim() || null;
}

async function readAllStdin(): Promise<string> {
  const lines: string[] = [];
  while (true) {
    const line = prompt();
    if (line === null) break;
    lines.push(line);
  }
  return lines.join("\n");
}

async function createNewThought() {
  const date = new Date().toISOString().split("T")[0];
  const title = Deno.args[0] || "untitled-thought";
  const fileName = `${date}-${title.toLowerCase().replace(/\s+/g, "-")}.md`;
  const filePath = join("src/content/thoughts", fileName);

  console.log("Enter your thought (press Ctrl+D when done):");
  const content = await readAllStdin();

  console.log("\nReview your thought:");
  console.log("--------------------");
  console.log(`Title: ${title}`);
  console.log(`Content:\n${content}`);
  console.log("--------------------");

  const confirm = prompt("Post this thought? (y/n) ");
  if (confirm?.toLowerCase() !== "y") {
    console.log("Cancelled.");
    return;
  }

  // Social media posting
  const socialUrls = generateSocialUrls(title);
  const socialLinks: { twitter?: string; bluesky?: string } = {};

  // Twitter
  if (prompt("\nPost to Twitter? (y/n) ")?.toLowerCase() === "y") {
    await openInBrowser(socialUrls.twitter);
    const twitterUrl = await waitForUrl("Twitter");
    if (twitterUrl) socialLinks.twitter = twitterUrl;
  }

  // Bluesky
  if (prompt("\nPost to Bluesky? (y/n) ")?.toLowerCase() === "y") {
    await openInBrowser(socialUrls.bluesky);
    const blueskyUrl = await waitForUrl("Bluesky");
    if (blueskyUrl) socialLinks.bluesky = blueskyUrl;
  }

  const frontmatter = yamlStringify({
    title,
    date,
    socialLinks,
  });

  const fullContent = `---\n${frontmatter}---\n\n${content}`;
  await Deno.writeTextFile(filePath, fullContent);
  console.log(`\nCreated new thought: ${filePath}`);

  if (socialLinks.twitter) console.log(`Twitter post: ${socialLinks.twitter}`);
  if (socialLinks.bluesky) console.log(`Bluesky post: ${socialLinks.bluesky}`);
}

if (import.meta.main) {
  createNewThought();
}
