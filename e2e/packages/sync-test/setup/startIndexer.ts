import chalk from "chalk";
import { execa } from "execa";
import { rmSync } from "node:fs";
import path from "node:path";

type IndexerOptions =
  | {
      indexer: "sqlite";
      sqliteFilename: string;
    }
  | {
      indexer: "postgres";
      databaseUrl: string;
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

  function cleanUp() {
    // attempt to clean up sqlite file
    if (opts.indexer === "sqlite") {
      try {
        rmSync(opts.sqliteFilename);
      } catch (error) {
        console.log("could not delete", opts.sqliteFilename, error);
      }
    }
  }

  let exited = false;
  proc.once("exit", () => {
    exited = true;
    cleanUp();
  });

  return {
    url: `http://127.0.0.1:${opts.port}/trpc`,
    doneSyncing,
    process: proc,
    kill: () =>
      new Promise<void>((resolve) => {
        if (exited) {
          return resolve();
        }
        proc.once("exit", resolve);
        proc.kill("SIGTERM", {
          forceKillAfterTimeout: 5000,
        });
      }),
  };
}

function extractLineContaining(containing: string, log: string): string[] {
  const pattern = new RegExp(`^.*${containing}.*?$`, "gm");
  return log.match(pattern) ?? [];
}
