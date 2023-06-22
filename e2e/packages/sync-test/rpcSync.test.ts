import { afterEach, beforeEach, describe, test } from "vitest";
import type { ViteDevServer } from "vite";
import { expect, Browser, Page } from "@playwright/test";
import { ExecaChildProcess } from "execa";
import { createAsyncErrorHandler } from "./asyncErrors";
import { startAnvil, deployContracts, startViteServer, startBrowserAndPage, openClientWithRootAccount } from "./setup";
import { setContractData, expectClientData, testData, encodedTestData } from "./data";

describe("Sync from RPC", async () => {
  const asyncErrorHandler = createAsyncErrorHandler();
  let anvilProcess: ExecaChildProcess;
  let webserver: ViteDevServer;
  let browser: Browser;
  let page: Page;
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

  test.only("test data should be set", async () => {
    await openClientWithRootAccount(page);

    // Wait for initial sync
    const blockNumber = page.locator("#block");
    await expect(blockNumber).not.toHaveText("-1");

    await setContractData(page, encodedTestData);
    await expectClientData(page, testData);

    asyncErrorHandler.expectNoAsyncErrors();
  });
});
