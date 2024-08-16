import { watchFile } from "fs";
import { readFile } from "fs/promises";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import process from "process";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXPLORER_DIR = path.resolve(__dirname, "..", "..", "packages", "explorer");
const WORLDS_JSON_PATH = path.resolve(__dirname, "packages", "contracts", "worlds.json");

const MODE = process.env.MODE || "development";
const CHAIN_ID = parseInt(process.env.CHAIN_ID || 31337);
let explorerProcess = null;

async function startExplorer() {
  process.env.INIT_PWD = process.cwd();
  process.env.NEXT_PUBLIC_CHAIN_ID = CHAIN_ID;

  const currentWorldAddress = process.env.NEXT_PUBLIC_WORLD_ADDRESS;
  const worldAddress = await readWorldsJson();
  process.env.NEXT_PUBLIC_WORLD_ADDRESS = worldAddress;
  if (currentWorldAddress) {
    if (currentWorldAddress === worldAddress) {
      return;
    }

    console.log("World address changed, restarting explorer...");
  }

  let command, args, workingDir;

  if (MODE === "production") {
    command = "pnpm";
    args = ["explorer"];
    workingDir = process.cwd();
  } else {
    command = "pnpm";
    args = ["dev"];
    workingDir = EXPLORER_DIR;
  }

  explorerProcess = spawn(command, args, {
    cwd: workingDir,
    stdio: "inherit",
    env: { ...process.env },
  });
}

async function readWorldsJson() {
  try {
    const data = await readFile(WORLDS_JSON_PATH, "utf8");
    if (data) {
      const worlds = JSON.parse(data);
      const world = worlds[CHAIN_ID];
      if (world) {
        return world.address;
      } else {
        console.error(`World not found for chain ID ${CHAIN_ID}`);
        return null;
      }
    }
  } catch (error) {
    console.error("Error reading worlds.json:", error);
    return null;
  }
}

async function restartExplorer() {
  if (explorerProcess) {
    explorerProcess.kill();
  }
  await startExplorer();
}

function watchWorldsJson() {
  watchFile(WORLDS_JSON_PATH, async () => {
    await restartExplorer();
  });
}

process.on("SIGINT", () => {
  if (explorerProcess) {
    explorerProcess.kill();
  }
  process.exit();
});

async function main() {
  await startExplorer();
  watchWorldsJson();
}

main().catch(console.error);
