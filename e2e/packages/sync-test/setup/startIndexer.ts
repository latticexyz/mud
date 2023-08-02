import chalk from "chalk";
import { execa } from "execa";

export function startIndexer(rpcUrl: string, reportError: (error: string) => void) {
  let resolve: () => void;
  let reject: (reason?: string) => void;

  console.log(chalk.magenta("[indexer]:"), "start syncing");

  // TODO: delete anvil.db file

  const proc = execa("pnpm", ["start:local"], {
    cwd: `${__dirname}/../../../../packages/store-indexer`,
    env: { DEBUG: "mud:store-indexer", RPC_HTTP_URL: rpcUrl },
  });

  proc.on("error", (error) => {
    const errorMessage = chalk.magenta("[indexer error]:", error);
    console.log(errorMessage);
    reportError(errorMessage);
    reject(errorMessage);
  });

  proc.stdout?.on("data", (data) => {
    const dataString = data.toString();
    const errors = extractLineContaining("ERROR", dataString).join("\n");
    if (errors) {
      console.log(chalk.magenta("[indexer error]:", errors));
      reject(errors);
    }
    console.log(chalk.magentaBright("[indexer]:", dataString));
  });

  proc.stderr?.on("data", (data) => {
    const dataString = data.toString();
    const modeErrors = extractLineContaining("ERROR", dataString).join("\n");
    if (modeErrors) {
      const errorMessage = chalk.magenta("[indexer error]:", modeErrors);
      console.log(errorMessage);
      reportError(errorMessage);
      reject(modeErrors);
    }
    if (data.toString().includes("all caught up")) {
      console.log(chalk.magenta("[indexer]:"), "done syncing");
      resolve();
    }
    console.log(chalk.magentaBright("[indexer ingress]:", dataString));
  });

  return {
    doneSyncing: new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    }),
    process: proc,
  };
}

function extractLineContaining(containing: string, log: string): string[] {
  const pattern = new RegExp(`^.*${containing}.*?$`, "gm");
  return log.match(pattern) ?? [];
}
