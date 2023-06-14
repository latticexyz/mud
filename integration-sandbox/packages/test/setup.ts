import { chromium, Browser, Page } from "@playwright/test";
import { execa, ExecaChildProcess } from "execa";
import chalk from "chalk";
import { createServer } from "vite";
import type { ViteDevServer } from "vite";

export function startAnvil(port: number): ExecaChildProcess {
  return execa("anvil", ["--block-base-fee-per-gas", "0", "--gas-limit", "20000000", "--port", String(port)]);
}

export function deployContracts(rpc: string): ExecaChildProcess {
  const deploymentProcess = execa("pnpm", ["mud", "deploy", "--rpc", rpc], { cwd: "../contracts", stdio: "pipe" });
  deploymentProcess.stdout?.on("data", (data) => {
    console.log(chalk.blueBright("[mud deploy]:"), data.toString());
  });

  deploymentProcess.stderr?.on("data", (data) => {
    console.error(chalk.blueBright("[mud deploy error]:"), data.toString());
  });
  return deploymentProcess;
}

export async function startViteServer(): Promise<ViteDevServer> {
  // TODO this should probably be preview instead of dev server
  const mode = "development";
  const server = await createServer({
    mode,
    server: { port: 3000 },
    root: "../client-vanilla",
  });
  await server.listen();
  return server;
}

export async function startBrowserAndPage(
  reportError: (error: string) => void
): Promise<{ browser: Browser; page: Page }> {
  // open browser page
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // log uncaught errors in the browser page (browser and test consoles are separate)
  page.on("pageerror", (err) => {
    console.log(chalk.yellow("[browser page error]:"), err.message);
  });

  // log browser's console logs
  page.on("console", (msg) => {
    if (msg.text().toLowerCase().includes("error")) {
      const errorMessage = chalk.yellowBright("[browser error]:") + chalk.red(msg.text());
      console.log(errorMessage);
      reportError(errorMessage);
    } else {
      console.log(chalk.yellowBright("[browser console]:"), msg.text());
    }
  });

  return { browser, page };
}

export function syncMODE(reportError: (error: string) => void) {
  let resolve: () => void;
  let reject: (reason?: string) => void;

  console.log(chalk.magenta("[mode]:"), "start syncing");

  const modeProcess = execa("./bin/mode", ["-config", "config.mode.yaml"], {
    cwd: "../../../packages/services",
    stdio: "pipe",
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
      resolve();
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
