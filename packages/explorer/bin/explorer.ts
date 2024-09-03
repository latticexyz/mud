#!/usr/bin/env node
import { watchFile } from "fs";
import { readFile } from "fs/promises";
import minimist from "minimist";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import { ChildProcess, spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const argv = minimist(process.argv.slice(2));
const port = argv.port || process.env.PORT || 13690;
const chainId = argv.chainId || process.env.CHAIN_ID || 31337;
const indexerDatabase = argv.indexerDatabase || process.env.INDEXER_DATABASE || "indexer.db";
const worldsFile = argv.worldsFile || process.env.WORLDS_FILE || "worlds.json";
const isDev = !!argv.dev;

let worldAddress = argv.worldAddress || process.env.WORLD_ADDRESS || null;
let explorerProcess: ChildProcess;

async function startExplorer() {
  let command, args;

  if (isDev) {
    command = "pnpm";
    args = ["dev"];
  } else {
    command = "pnpm";
    args = ["start"];
  }

  explorerProcess = spawn(command, args, {
    cwd: __dirname,
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: port,
      NEXT_PUBLIC_CHAIN_ID: chainId,
      NEXT_PUBLIC_WORLD_ADDRESS: worldAddress,
      INDEXER_DATABASE: path.join(process.cwd(), indexerDatabase),
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
  // If world address is not provided, try to read it from worlds.json
  if (!worldAddress) {
    worldAddress = await readWorldsJson();

    // If world address is still not found, throw an error
    if (!worldAddress) {
      throw new Error(
        `No world address found in "${worldsFile}" file. Either run \`mud deploy\` to create one or provide one with \`--worldAddress\`.`,
      );
    }

    // only watch worlds.json if world address was not provided with --worldAddress
    watchWorldsJson();
  }

  await startExplorer();
}

main().catch(console.error);
