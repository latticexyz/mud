import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import { readFile, watch } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXPLORER_DIR = path.resolve(__dirname, "..", "..", "packages", "explorer");
const WORLDS_JSON_PATH = path.resolve(__dirname, "packages", "contracts", "worlds.json");

const MODE = process.env.MODE || "production";
let explorerProcess = null;

async function readWorldsJson() {
  try {
    const data = await readFile(WORLDS_JSON_PATH, "utf8");
    return data;
  } catch (error) {
    console.error("Error reading worlds.json:", error);
    return null;
  }
}

async function startExplorer() {
  process.env.INIT_PWD = process.cwd();
  process.env.NEXT_PUBLIC_WORLDS_CONFIG = await readWorldsJson();

  console.log("Starting explorer");

  let command, args, workingDir;

  if (MODE === "production") {
    console.log("Running explorer in production mode");
    command = "pnpm";
    args = ["explorer"];
    workingDir = process.cwd();
  } else {
    console.log("Running explorer in development mode");
    command = "pnpm";
    args = ["dev"];
    workingDir = EXPLORER_DIR;
  }

  explorerProcess = spawn(command, args, {
    cwd: workingDir,
    stdio: "inherit",
    env: { ...process.env },
  });

  explorerProcess.on("close", (code) => {
    console.log(`Explorer process exited with code ${code}`);
  });
}

async function restartExplorer() {
  if (explorerProcess) {
    explorerProcess.kill();
  }
  await startExplorer();
}

async function watchWorldsJson() {
  try {
    const watcher = watch(WORLDS_JSON_PATH);
    for await (const event of watcher) {
      if (event.eventType === "change") {
        console.log("worlds.json has changed. Restarting explorer...");
        await restartExplorer();
      }
    }
  } catch (error) {
    console.error("Error watching worlds.json:", error);
  }
}

// Handle script termination
process.on("SIGINT", () => {
  if (explorerProcess) {
    explorerProcess.kill();
  }
  process.exit();
});

// Start the explorer and watch for changes
async function main() {
  await startExplorer();
  await watchWorldsJson();
}

main().catch(console.error);
