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

// Watch multiple directories
const watchers = [Deno.watchFs("src"), Deno.watchFs("scripts")];
const debounceDuration = 300;

// Debounced rebuild function to prevent excessive triggering
const debouncedRebuild = debounce(rebuild, debounceDuration);

// Watch for file changes and trigger rebuild
console.log("Watching for changes in the 'src' and 'scripts' directories...");

// Create an async function to handle each watcher
async function watchDirectory(watcher: Deno.FsWatcher) {
  try {
    for await (const events of watcher) {
      if (
        events.kind === "modify" ||
        events.kind === "create" ||
        events.kind === "remove"
      ) {
        await debouncedRebuild();
      }
    }
  } catch (error) {
    console.error("Watch error:", error);
  }
}

// Start all watchers concurrently
await Promise.all(watchers.map((watcher) => watchDirectory(watcher)));
