import { watchFile } from "fs";
import { readFile } from "fs/promises";
import minimist from "minimist";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const argv = minimist(process.argv.slice(2));
const port = argv.port || process.env.PORT || 13690;
const chainId = argv.chainId || process.env.CHAIN_ID || 31337;
const mode = argv.mode || process.env.MODE || "production";
const indexerDatabase = argv.indexerDatabase || process.env.INDEXER_DATABASE || "indexer.db";
const worldsFile = argv.worldsFile || process.env.WORLDS_FILE || null;

let worldAddress = argv.worldAddress || process.env.WORLD_ADDRESS || null;
let explorerProcess;

async function startExplorer() {
  let command, args;

  if (mode === "production") {
    command = "pnpm";
    args = ["start"];
  } else {
    command = "pnpm";
    args = ["dev"];
  }

  explorerProcess = spawn(command, args, {
    cwd: __dirname,
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: port,
      INIT_PWD: process.cwd(),
      WORLD_ADDRESS: worldAddress,
      INDEXER_DATABASE: indexerDatabase,
    },
  });
}

async function readWorldsJson() {
  try {
    const data = await readFile(worldsFile, "utf8");
    if (data) {
      const worlds = JSON.parse(data);
      const world = worlds[chainId];
      if (world) {
        return world.address;
      } else {
        console.error(`World not found for chain ID ${chainId}`);
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
  if (!worldsFile) {
    return;
  }

  watchFile(worldsFile, async () => {
    const newWorldAddress = await readWorldsJson();
    if (worldAddress && worldAddress !== newWorldAddress) {
      console.log("\nWorld address changed, restarting explorer...");

      worldAddress = newWorldAddress;
      await restartExplorer();
    }
  });
}

process.on("SIGINT", () => {
  if (explorerProcess) {
    explorerProcess.kill();
  }
  process.exit();
});

async function main() {
  if (!worldsFile && !worldAddress) {
    throw new Error(
      "Neither worldsFile nor worldAddress provided. Use --worldsFile or --worldAddress to specify a world.",
    );
  }

  if (worldsFile) {
    worldAddress = await readWorldsJson();
    watchWorldsJson();
  }

  await startExplorer();
}

main().catch(console.error);
