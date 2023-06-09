import { afterEach, beforeEach, describe, test } from "vitest";
import { createServer } from "vite";
import type { ViteDevServer } from "vite";
import { expect, chromium, Browser, Page } from "@playwright/test";
// import { deployHandler } from "@latticexyz/cli";
import { execa, ExecaChildProcess } from "execa";
import chalk from "chalk";
import { exec, ChildProcess } from "node:child_process";

describe("arrays", async () => {
  let server: ViteDevServer;
  let browser: Browser;
  let page: Page;
  let anvilProcess: ExecaChildProcess;
  let deploymentProcess: ExecaChildProcess;
  let modeProcess: ChildProcess;
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
      console.log(chalk.yellow("[browser page]:"), err.message);
    });

    // log browser's console logs
    page.on("console", (msg) => {
      console.log(chalk.yellowBright("[browser console]:"), msg.text());
    });
  });

  afterEach(async () => {
    await browser.close();
    await server.close();
    anvilProcess?.kill();
    deploymentProcess?.kill();
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

  describe("RPC sync", () => {
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
  });

  describe("MODE sync", () => {
    beforeEach(() => {
      syncMODE();
    });

    afterEach(() => {
      modeProcess?.kill();
    });

    test.only("large list should have correct length", async () => {
      await page.goto("http://localhost:3000?cache=false&mode=http://localhost:50091");

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
    deploymentProcess = execa("pnpm", ["mud", "deploy", "--rpc", rpc], { cwd: "../contracts" });
    deploymentProcess.stdout?.on("data", (data) => {
      console.log(chalk.blueBright("[mud deploy]:"), data.toString());
    });

    deploymentProcess.stderr?.on("data", (data) => {
      console.error(chalk.blueBright("[mud deploy error]:"), data.toString());
    });
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
    console.log("syncing mode");
    modeProcess = exec(
      "./bin/mode -config config.mode.yaml",
      { cwd: "../../../packages/services" },
      (error, stdout, stderr) => {
        if (error) console.log(chalk.magenta("[mode error]:"));
        if (stdout) console.log(chalk.magenta("[mode stdout]:", stdout));
        if (stderr) console.log(chalk.magenta("[mode stderr]:"));
      }
    );

    return modeProcess;
  }
});
