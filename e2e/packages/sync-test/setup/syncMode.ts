import chalk from "chalk";
import { execa } from "execa";

export function syncMode(reportError: (error: string) => void) {
  let resolve: () => void;
  let reject: (reason?: string) => void;

  console.log(chalk.magenta("[mode]:"), "start syncing");

  const modeProcess = execa("./bin/mode", ["-config", "config.mode.yaml"], {
    cwd: "../../../packages/services",
    stdio: "pipe",
  });

  modeProcess.on("error", (error) => {
    const errorMessage = chalk.magenta("[mode error]:", error);
    console.log(errorMessage);
    reportError(errorMessage);
    reject(errorMessage);
  });

  modeProcess.stdout?.on("data", (data) => {
    const dataString = data.toString();
    const errors = extractLineContaining("ERROR", dataString).join("\n");
    if (errors) {
      console.log(chalk.magenta("[mode error]:", errors));
      reject(errors);
    }
    console.log(chalk.magentaBright("[mode postgres]:", dataString));
  });

  modeProcess.stderr?.on("data", (data) => {
    const dataString = data.toString();
    const modeErrors = extractLineContaining("ERROR", dataString).join("\n");
    if (modeErrors) {
      const errorMessage = chalk.magenta("[mode error]:", modeErrors);
      console.log(errorMessage);
      reportError(errorMessage);
      reject(modeErrors);
    }
    if (data.toString().includes("finished syncing")) {
      console.log(chalk.magenta("[mode]:"), "done syncing");
      // Wait for 2s after MODE is done syncing to avoid race conditions
      // with the first block number not being available yet
      setTimeout(resolve, 2000);
    }
    console.log(chalk.magentaBright("[mode ingress]:", dataString));
  });

  return {
    doneSyncing: new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    }),
    process: modeProcess,
  };
}

function extractLineContaining(containing: string, log: string): string[] {
  const pattern = new RegExp(`^.*${containing}.*?$`, "gm");
  return log.match(pattern) ?? [];
}
