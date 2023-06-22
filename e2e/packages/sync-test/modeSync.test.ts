import { afterEach, beforeEach, describe, test } from "vitest";
import type { ViteDevServer } from "vite";
import { expect, Browser, Page } from "@playwright/test";
import { ExecaChildProcess } from "execa";
import { createAsyncErrorHandler } from "./asyncErrors";
import {
  startAnvil,
  deployContracts,
  startViteServer,
  startBrowserAndPage,
  syncMode,
  openClientWithRootAccount,
} from "./setup";
import { encodedTestData, expectClientData, setContractData, testData } from "./data";

describe("Sync from MODE", async () => {
  const asyncErrorHandler = createAsyncErrorHandler();
  let anvilProcess: ExecaChildProcess;
  let webserver: ViteDevServer;
  let browser: Browser;
  let page: Page;
  const anvilPort = 8545;
  const rpc = `http://127.0.0.1:${anvilPort}`;
  let modeProcess: ExecaChildProcess;
  const modeUrl = "http://localhost:50092";

  beforeEach(async () => {
    asyncErrorHandler.resetErrors();

    // Start chain and deploy contracts
    anvilProcess = startAnvil(anvilPort);
    await deployContracts(rpc);

    // Start client and browser
    webserver = await startViteServer();
    const browserAndPage = await startBrowserAndPage(asyncErrorHandler.reportError);
    browser = browserAndPage.browser;
    page = browserAndPage.page;

    // Start MODE
    const result = syncMode(asyncErrorHandler.reportError);
    modeProcess = result.process;
    await result.doneSyncing;
  });

  afterEach(async () => {
    await browser.close();
    await webserver.close();
    modeProcess?.kill();
    anvilProcess?.kill();
  });

  test("test data should be set", async () => {
    await openClientWithRootAccount(page, { modeUrl });

    // Wait for initial sync
    const blockNumber = page.locator("#block");
    await expect(blockNumber).not.toHaveText("-1");

    await setContractData(page, encodedTestData);
    await expectClientData(page, testData);

    asyncErrorHandler.expectNoAsyncErrors();
  });

  test("should throw browser error if MODE is down", async () => {
    modeProcess?.kill();

    await openClientWithRootAccount(page, { modeUrl });

    // Wait for initial sync
    const blockNumber = page.locator("#block");
    await expect(blockNumber).not.toHaveText("-1");

    expect(asyncErrorHandler.getErrors()).toHaveLength(1);
    expect(asyncErrorHandler.getErrors()[0]).toContain(
      "MODE Error:  ClientError: /mode.QueryLayer/GetPartialState UNKNOWN: Response closed without headers"
    );
  });
});
