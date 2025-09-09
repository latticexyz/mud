#!/usr/bin/env node
import { config } from "dotenv";
import { rm } from "fs/promises";
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

config({ path: path.join(packageRoot, ".env") });
config({ path: path.join(packageRoot, ".env.local") });

const argv = yargs(process.argv.slice(2))
  .options({
    port: {
      alias: "p",
      description: "Port number for the server",
      type: "number",
      default: process.env.PORT || 13690,
    },
    devIndexerPort: {
      alias: "pi",
      description: "Port number for the development indexer",
      type: "number",
      default: process.env.DEV_INDEXER_PORT || 3001,
    },
    indexerUrl: {
      alias: "iu",
      description: "The indexer URL to use. Defaults to the one from the chain config",
      type: "string",
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
    dev: {
      alias: "D",
      description: "Run in development mode",
      type: "boolean",
      default: false,
    },
  })
  .check((argv) => {
    validateChainId(Number(argv.chainId));
    return true;
  })
  .parseSync();

const { port, devIndexerPort, indexerUrl, hostname, chainId, indexerDatabase, dev } = argv;
const indexerDatabasePath = path.join(packageRoot, indexerDatabase);

let explorerProcess: ChildProcess;
let indexerProcess: ChildProcess;

async function startExplorer() {
  const env = {
    ...process.env,
    CHAIN_ID: chainId.toString(),
    DEV_INDEXER_PORT: devIndexerPort.toString(),
    INDEXER_URL: indexerUrl,
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
      ENABLE_UNSAFE_QUERY_API: "true",
      SQLITE_FILENAME: indexerDatabase,
      ...process.env,
      PORT: devIndexerPort.toString(),
    },
  });
}

process.on("exit", () => {
  indexerProcess?.kill();
  explorerProcess?.kill();
});

async function main() {
  await startStoreIndexer();
  await startExplorer();
}

main().catch(console.error);
