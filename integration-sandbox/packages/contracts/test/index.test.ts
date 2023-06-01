import { afterAll, beforeAll, describe, test } from "vitest";
import { createServer } from "vite";
import type { ViteDevServer } from "vite";
import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
import { expect } from "@playwright/test";
import { deployHandler } from "@latticexyz/cli";
import { execa, ExecaChildProcess } from "execa";

describe("arrays", async () => {
  let server: ViteDevServer;
  let browser: Browser;
  let page: Page;
  let anvilProcess: ExecaChildProcess;

  beforeAll(async () => {
    // start anvil
    const anvilPort = 8545;
    const forkRpc = `http://127.0.0.1:${anvilPort}`;
    anvilProcess = execa("anvil", [
      "--block-base-fee-per-gas",
      "0",
      "--gas-limit",
      "20000000",
      "--port",
      String(anvilPort),
    ]);

    // deploy contracts
    await deployHandler({
      saveDeployment: true,
      rpc: forkRpc,
      priorityFeeMultiplier: 1,
      disableTxWait: false,
      pollInterval: 1000,
    });

    // start vite
    const mode = "development";
    // TODO this should probably be preview instead of dev server
    server = await createServer({
      mode,
      server: { port: 3000 },
      root: "../client-vanilla",
    });
    await server.listen();
    // open browser page
    browser = await chromium.launch();
    page = await browser.newPage();

    // log uncaught errors in the browser page (browser and test consoles are separate)
    page.on("pageerror", (err) => {
      console.log("Browser page error:", err.message);
    });
  });

  afterAll(async () => {
    await browser.close();
    await server.close();
    anvilProcess.kill();
  });

  test("big list should have correct length", async () => {
    await page.goto("http://localhost:3000");
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
    await expect(listLength).toHaveText("0", { timeout: 120_000 });
    await expect(lastItem).toHaveText("unset");

    await pushManyButton.click();
    await expect(listLength).toHaveText("5000", { timeout: 60_000 });
    await expect(lastItem).toHaveText("4999");
    await pushOneButton.click();
    await expect(listLength).toHaveText("5001");
    await expect(lastItem).toHaveText("123");
    await pushManyButton.click();
    await expect(listLength).toHaveText("10001", { timeout: 60_000 });
    await expect(lastItem).toHaveText("4999");
    await pushOneButton.click();
    await expect(listLength).toHaveText("10002");
    await expect(lastItem).toHaveText("123");
  });
});
