// watch.ts
import { debounce } from "https://deno.land/std@0.125.0/async/debounce.ts";

// Move rebuild function to top level for initial build
async function rebuild() {
  console.log("Rebuilding site...");
  const process = Deno.run({
    cmd: ["deno", "run", "--allow-read", "--allow-write", "scripts/build.ts"],
    stdout: "inherit",
    stderr: "inherit",
  });

  const status = await process.status();
  process.close();

  if (!status.success) {
    console.error("Rebuild failed!");
    return;
  }
  console.log("Rebuild complete.");
}

// Run initial build
console.log("Running initial build...");
await rebuild();

const watcher = Deno.watchFs("src");
const debounceDuration = 300;

// Debounced rebuild function to prevent excessive triggering
const debouncedRebuild = debounce(rebuild, debounceDuration);

// Watch for file changes and trigger rebuild
console.log("Watching for changes in the 'src' directory...");
for await (const event of watcher) {
  if (
    event.kind === "modify" ||
    event.kind === "create" ||
    event.kind === "remove"
  ) {
    await debouncedRebuild();
  }
}
