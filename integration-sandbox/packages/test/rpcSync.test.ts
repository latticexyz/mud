import { afterEach, beforeEach, describe, test } from "vitest";
import type { ViteDevServer } from "vite";
import { expect, Browser, Page } from "@playwright/test";
import { ExecaChildProcess } from "execa";
import { createAsyncErrorHandler } from "./asyncErrors";
import { startAnvil, deployContracts, startViteServer, startBrowserAndPage } from "./setup";

describe.skip("Sync from RPC", async () => {
  const asyncErrorHandler = createAsyncErrorHandler();
  let webserver: ViteDevServer;
  let browser: Browser;
  let page: Page;
  let anvilProcess: ExecaChildProcess;
  const anvilPort = 8545;
  const rpc = `http://127.0.0.1:${anvilPort}`;

  beforeEach(async () => {
    asyncErrorHandler.resetErrors();

    anvilProcess = startAnvil(anvilPort);
    await deployContracts(rpc);
    webserver = await startViteServer();
    const browserAndPage = await startBrowserAndPage(asyncErrorHandler.reportError);
    browser = browserAndPage.browser;
    page = browserAndPage.page;
  });

  afterEach(async () => {
    await browser.close();
    await webserver.close();
    anvilProcess?.kill();
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

    asyncErrorHandler.expectNoAsyncErrors();
  });
});
