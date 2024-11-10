// watch.ts
import { debounce } from "https://deno.land/std@0.125.0/async/debounce.ts";

const watcher = Deno.watchFs("src"); // Watch the `src` folder
const debounceDuration = 300; // Delay between rebuilds (ms)

async function rebuild() {
  console.log("Rebuilding site...");
  const process = Deno.run({
    cmd: ["deno", "run", "--allow-read", "--allow-write", "build.ts"],
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
