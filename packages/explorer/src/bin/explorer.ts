#!/usr/bin/env node
import { watchFile } from "fs";
import { readFile, rm } from "fs/promises";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import { anvil } from "viem/chains";
import yargs from "yargs";
import { ChildProcess, spawn } from "child_process";
import { validateChainId } from "../common";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.join(__dirname, "..", "..");

const argv = yargs(process.argv.slice(2))
  .options({
    port: {
      alias: "p",
      description: "Port number for the server",
      type: "number",
      default: process.env.PORT || 13690,
    },
    hostname: {
      alias: "H",
      description: "Host for the server",
      type: "string",
    },
    chainId: {
      alias: "c",
      description: "Chain ID",
      type: "number",
      default: process.env.CHAIN_ID || 31337,
    },
    indexerDatabase: {
      alias: "i",
      description: "Path to the indexer database",
      type: "string",
      default: process.env.INDEXER_DATABASE || "indexer.db",
    },
    worldsFile: {
      alias: "w",
      description: "Path to the worlds.json file",
      type: "string",
      default: process.env.WORLDS_FILE || "worlds.json",
    },
    dev: {
      alias: "D",
      description: "Run in development mode",
      type: "boolean",
      default: false,
    },
    worldAddress: {
      alias: "a",
      description: "World address",
      type: "string",
      default: process.env.WORLD_ADDRESS,
    },
    disableFrontPage: {
      alias: "f",
      description: "Disable the entry page and redirect to the Explorer",
      type: "boolean",
      default: true,
    },
  })
  .check((argv) => {
    validateChainId(Number(argv.chainId));
    return true;
  })
  .parseSync();

const { port, hostname, chainId, indexerDatabase, worldsFile, dev, disableFrontPage } = argv;
const indexerDatabasePath = path.join(packageRoot, indexerDatabase);

let worldAddress = argv.worldAddress;
let explorerProcess: ChildProcess;
let indexerProcess: ChildProcess;

async function startExplorer() {
  const env = {
    ...process.env,
    CHAIN_ID: chainId.toString(),
    WORLD_ADDRESS: worldAddress?.toString(),
    INDEXER_DATABASE: indexerDatabasePath,
    DISABLE_FRONT_PAGE: disableFrontPage ? "1" : "0",
  };

  if (dev) {
    explorerProcess = spawn(
      "node_modules/.bin/next",
      ["dev", "--port", port.toString(), ...(hostname ? ["--hostname", hostname] : [])],
      {
        cwd: packageRoot,
        stdio: "inherit",
        env,
      },
    );
  } else {
    explorerProcess = spawn("node", [".next/standalone/packages/explorer/server.js"], {
      cwd: packageRoot,
      stdio: "inherit",
      env: {
        ...env,
        PORT: port.toString(),
        HOSTNAME: hostname,
      },
    });
  }
}

async function startStoreIndexer() {
  if (chainId !== anvil.id) {
    console.log("Skipping SQLite indexer for non-anvil chain ID", chainId);
    return;
  }

  await rm(indexerDatabasePath, { recursive: true, force: true });

  console.log("Running SQLite indexer for anvil...");
  indexerProcess = spawn("sh", ["node_modules/.bin/sqlite-indexer"], {
    cwd: packageRoot,
    stdio: "inherit",
    env: {
      DEBUG: "mud:*",
      RPC_HTTP_URL: "http://127.0.0.1:8545",
      FOLLOW_BLOCK_TAG: "latest",
      SQLITE_FILENAME: indexerDatabase,
      STORE_ADDRESS: worldAddress,
      ...process.env,
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
  indexerProcess?.kill();
  explorerProcess?.kill();

  await startStoreIndexer();
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

process.on("exit", () => {
  indexerProcess?.kill();
  explorerProcess?.kill();
});

async function main() {
  // If world address is not provided, try to read it from worldsFile.
  // Provided worldAddress or worldsFile is only required if entry page is disabled.
  if (disableFrontPage && !worldAddress) {
    worldAddress = await readWorldsJson();

    // If world address is still not found, throw an error
    if (!worldAddress) {
      throw new Error(
        `No world address found in "${worldsFile}" file. Either run \`mud deploy\` to create one or provide one with \`--worldAddress\`.`,
      );
    }

    // only watch worldsFile if world address was not provided with --worldAddress
    watchWorldsJson();
  }

  await startStoreIndexer();
  await startExplorer();
}

main().catch(console.error);
