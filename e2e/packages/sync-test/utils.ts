import { chromium, Browser, Page } from "@playwright/test";
import { execa, ExecaChildProcess } from "execa";
import chalk from "chalk";
import { createServer } from "vite";
import type { ViteDevServer } from "vite";
import { Data, EncodedData } from "./data";
import { deferred } from "@latticexyz/utils";
import { Address, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import WorldAbi from "../contracts/abi/IWorld.sol/IWorld.abi.json";
import dotenv from "dotenv";
dotenv.config({ path: "../contracts/.env" });

// TODO: update this after https://github.com/latticexyz/mud/pull/1025 is in
import config from "../contracts/mud.config";

// Extract the storeCache type directly from the client
import { setup } from "../client-vanilla/src/mud/setup";
import { expect } from "vitest";
type StoreCache = Awaited<ReturnType<typeof setup>>["network"]["storeCache"];

export function startAnvil(port: number): ExecaChildProcess {
  return execa("anvil", [
    "-b",
    "1",
    "--block-base-fee-per-gas",
    "0",
    "--gas-limit",
    "20000000",
    "--port",
    String(port),
  ]);
}
// function extractWorldAddress(input: string): Address | null {
//   const match = input.match(/worldAddress: '([^']+)'/);
//   return match ? (match[1] as Address) : null;
// }

// export function getWallet(rpc: string) {
//   const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
//   if (!privateKey) throw new Error("No private key");
//   const account = privateKeyToAccount(privateKey);
//   return createWalletClient({ account, transport: http(rpc) });
// }

export function deployContracts(rpc: string) {
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

export async function readClientStore(page: Page, selector: Parameters<StoreCache["get"]>): Promise<StoreCache> {
  return page.evaluate((_selector) => {
    console.log("Window on the browser", window);
    return window["storeCache"].get(..._selector);
  }, selector);
}

export async function setContractData(page: Page, data: EncodedData) {
  return page.evaluate((_data) => {
    function stringToBytes16(str: string): Uint8Array {
      if (str.length > 16) throw new Error("string too long");
      return new Uint8Array(16).map((v, i) => str.charCodeAt(i));
    }

    const promises: Promise<unknown>[] = [];
    for (const [table, records] of Object.entries(_data)) {
      for (const record of records) {
        const promise = window["worldContract"]["setRecord(bytes16,bytes16,bytes32[],bytes)"](
          // TODO: add support for multiple namespaces after https://github.com/latticexyz/mud/issues/994 is resolved
          stringToBytes16(""),
          stringToBytes16(table),
          record.key,
          record.value
        );

        // Wait for transactions to be confirmed
        promises.push(promise.then((tx) => tx.wait()));
      }
    }
    console.log("done sending");
    return Promise.all(promises);
  }, data);
}

export async function expectClientData(page: Page, data: Data) {
  for (const [table, records] of Object.entries(data)) {
    for (const record of records) {
      const value = await readClientStore(page, [config.namespace, table, record.key]);
      expect(value).toEqual(record.value);
    }
  }
}
