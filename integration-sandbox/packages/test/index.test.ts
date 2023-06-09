import { afterEach, beforeEach, describe, test } from "vitest";
import { createServer } from "vite";
import type { ViteDevServer } from "vite";
import { expect, chromium, Browser, Page } from "@playwright/test";
// import { deployHandler } from "@latticexyz/cli";
import { execa, ExecaChildProcess } from "execa";

describe("arrays", async () => {
  let server: ViteDevServer;
  let browser: Browser;
  let page: Page;
  let anvilProcess: ExecaChildProcess;
  let deploymentProcess: ExecaChildProcess;
  let modeProcess: ExecaChildProcess;
  const anvilPort = 8545;
  const rpc = `http://127.0.0.1:${anvilPort}`;

  beforeEach(async () => {
    startAnvil();
    await deployContracts();
    await startViteServer();

    // open browser page
    browser = await chromium.launch();
    page = await browser.newPage();

    // log uncaught errors in the browser page (browser and test consoles are separate)
    page.on("pageerror", (err) => {
      console.log("Browser page error:", err.message);
    });

    // log browser's console logs
    page.on("console", (msg) => {
      console.log("Browser console:", msg.text());
    });
  });

  afterEach(async () => {
    await browser.close();
    await server.close();
    anvilProcess.kill();
    deploymentProcess.kill();
  });

  test("large list should have correct length", async () => {
    await page.goto("http://localhost:3000?cache=false");

    const resetButton = page.getByRole("button", { name: /Reset list/ });
    const pushManyButton = page.getByRole("button", { name: /Push 5000 items/ });
    const pushOneButton = page.getByRole("button", { name: /Push 1 item/ });
    const listLength = page.getByTestId("list-length");
    const lastItem = page.getByTestId("last-item");

    await expect(resetButton).toBeVisible();
    await expect(pushManyButton).toBeVisible();
    await expect(pushOneButton).toBeVisible();

    // make sure setup is finished before clicking buttons
    await expect(page.getByTitle("Setup status")).toHaveText("finished");

    await resetButton.click();
    await expect(listLength).toHaveText("0");
    await expect(lastItem).toHaveText("unset");
    await pushManyButton.click();
    await expect(listLength).toHaveText("5000");
    await expect(lastItem).toHaveText("4999");
    await pushOneButton.click();
    await expect(listLength).toHaveText("5001");
    await expect(lastItem).toHaveText("123");
    await pushManyButton.click();
    await expect(listLength).toHaveText("10001");
    await expect(lastItem).toHaveText("4999");
    await pushOneButton.click();
    await expect(listLength).toHaveText("10002");
    await expect(lastItem).toHaveText("123");
  });

  test("large list should have correct length", async () => {
    await page.goto("http://localhost:3000?cache=false");

    const resetButton = page.getByRole("button", { name: /Reset list/ });
    const pushManyButton = page.getByRole("button", { name: /Push 5000 items/ });
    const pushOneButton = page.getByRole("button", { name: /Push 1 item/ });
    const listLength = page.getByTestId("list-length");
    const lastItem = page.getByTestId("last-item");

    await expect(resetButton).toBeVisible();
    await expect(pushManyButton).toBeVisible();
    await expect(pushOneButton).toBeVisible();

    // make sure setup is finished before clicking buttons
    await expect(page.getByTitle("Setup status")).toHaveText("finished");

    await resetButton.click();
    await expect(listLength).toHaveText("0");
    await expect(lastItem).toHaveText("unset");
    await pushManyButton.click();
    await expect(listLength).toHaveText("5000");
    await expect(lastItem).toHaveText("4999");
    await pushOneButton.click();
    await expect(listLength).toHaveText("5001");
    await expect(lastItem).toHaveText("123");
    await pushManyButton.click();
    await expect(listLength).toHaveText("10001");
    await expect(lastItem).toHaveText("4999");
    await pushOneButton.click();
    await expect(listLength).toHaveText("10002");
    await expect(lastItem).toHaveText("123");
  });

  function startAnvil() {
    anvilProcess = execa("anvil", [
      "--block-base-fee-per-gas",
      "0",
      "--gas-limit",
      "20000000",
      "--port",
      String(anvilPort),
    ]);
  }

  async function deployContracts() {
    console.log("Deploying contracts");
    deploymentProcess = execa("pnpm", ["mud", "deploy", "--rpc", rpc], { cwd: "../contracts", stdio: "inherit" });
    await deploymentProcess;
  }

  async function startViteServer() {
    // TODO this should probably be preview instead of dev server
    const mode = "development";
    server = await createServer({
      mode,
      server: { port: 3000 },
      root: "../client-vanilla",
    });
    await server.listen();
  }

  async function syncMODE() {
    modeProcess = execa("make", ["run-mode"], { cwd: "../../../packages/services/" });

    modeProcess.stdout?.on("data", (data) => {
      console.log("MODE log:", data.toString());
    });

    modeProcess.stderr?.on("data", (data) => {
      console.error("MODE error", data.toString());
      modeProcess.kill();
    });

    return modeProcess;
  }
});
