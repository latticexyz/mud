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
const port = argv.port || 13690;
const env = argv.env || "production";
const chainId = argv.chainId || 31337;
const worldsConfigPath = argv.worldsConfigPath || null;

let worldAddress = argv.worldAddress || null;
let explorerProcess;

async function startExplorer() {
  let command, args;

  if (env === "production") {
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
    },
  });
}

async function readWorldsJson() {
  try {
    const data = await readFile(worldsConfigPath, "utf8");
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
  if (!worldsConfigPath) {
    return;
  }

  watchFile(worldsConfigPath, async () => {
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
  if (!worldsConfigPath && !worldAddress) {
    throw new Error(
      "Neither worldsConfigPath nor worldAddress provided. Use --worldsConfigPath or --worldAddress to specify a world.",
    );
  }

  if (worldsConfigPath) {
    worldAddress = await readWorldsJson();
    watchWorldsJson();
  }

  await startExplorer();
}

main().catch(console.error);
