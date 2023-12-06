import chalk from "chalk";
import { execa } from "execa";
import { rmSync } from "node:fs";
import path from "node:path";
import { dropDatabase } from "@latticexyz/store-sync/postgres";
import postgres from "postgres";
import { deferred } from "@latticexyz/utils";

type IndexerOptions =
  | {
      indexer: "sqlite";
      sqliteFilename: string;
    }
  | {
      indexer: "postgres";
      databaseUrl: string;
      rootDatabaseUrl: string;
    };

type StartIndexerOptions = {
  port: number;
  rpcHttpUrl: string;
  reportError: (error: string) => void;
} & IndexerOptions;

export function startIndexer(opts: StartIndexerOptions) {
  let resolve: () => void;
  let reject: (reason?: string) => void;
  const doneSyncing = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const env = {
    DEBUG: "mud:*",
    PORT: opts.port.toString(),
    CHAIN_ID: "31337",
    RPC_HTTP_URL: opts.rpcHttpUrl,
    SQLITE_FILENAME: opts.indexer === "sqlite" ? opts.sqliteFilename : undefined,
    DATABASE_URL: opts.indexer === "postgres" ? opts.databaseUrl : undefined,
    ROOT_DATABASE_URL: opts.indexer === "postgres" ? opts.rootDatabaseUrl : undefined,
  };
  console.log(chalk.magenta("[indexer]:"), "starting indexer", env);

  const proc = execa("pnpm", opts.indexer === "postgres" ? ["start:postgres"] : ["start:sqlite"], {
    cwd: path.join(__dirname, "..", "..", "..", "..", "packages", "store-indexer"),
    env,
  });

  proc.on("error", (error) => {
    const errorMessage = chalk.magenta("[indexer error]:", error);
    console.log(errorMessage);
    reportError(errorMessage);
    reject(errorMessage);
  });

  function onLog(data: string) {
    const errors = extractLineContaining("ERROR", data).join("\n");
    if (errors) {
      const errorMessage = chalk.magenta("[indexer error]:", errors);
      console.log(errorMessage);
      reportError(errorMessage);
      reject(errors);
    }
    if (data.toString().includes("all caught up")) {
      console.log(chalk.magenta("[indexer]:"), "done syncing");
      resolve();
    }
    console.log(chalk.magentaBright("[indexer]:", data));
  }

  proc.stdout?.on("data", (data) => onLog(data.toString()));
  proc.stderr?.on("data", (data) => onLog(data.toString()));

  // Create a promise to indicate the process is killed and cleaned up
  const [resolveKilled, , killed] = deferred<void>();

  // Call clean up if the process is killed
  proc.once("exit", cleanUp);

  // Clean up databases and resolved the `killed` promise at the end
  async function cleanUp() {
    // attempt to clean up sqlite file
    if (opts.indexer === "sqlite") {
      try {
        return rmSync(opts.sqliteFilename);
      } catch (error) {
        console.log("could not delete", opts.sqliteFilename, error);
      }
    }

    // attempt to drop the test database
    if (opts.indexer === "postgres") {
      const databaseName = new URL(opts.databaseUrl).pathname.split("/")[1];
      try {
        console.log("dropping database", databaseName);
        const sql = postgres(opts.rootDatabaseUrl);
        await dropDatabase(sql, databaseName);
      } catch (error) {
        console.log("could not drop database", databaseName, error);
      }
    }

    resolveKilled();
  }

  return {
    url: `http://127.0.0.1:${opts.port}/trpc`,
    doneSyncing,
    process: proc,
    kill: () => {
      // Initiate the kill sequence, the returned promise resolves once clean up is complete
      proc.kill("SIGTERM", {
        forceKillAfterTimeout: 5000,
      });
      return killed;
    },
  };
}

function extractLineContaining(containing: string, log: string): string[] {
  const pattern = new RegExp(`^.*${containing}.*?$`, "gm");
  return log.match(pattern) ?? [];
}
