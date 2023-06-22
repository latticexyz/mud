import { afterEach, beforeEach, describe, test } from "vitest";
import type { ViteDevServer } from "vite";
import { expect, Browser, Page } from "@playwright/test";
import { ExecaChildProcess } from "execa";
import { createAsyncErrorHandler } from "./asyncErrors";
import { startAnvil, deployContracts, startViteServer, startBrowserAndPage, openClientWithRootAccount } from "./setup";
import { setContractData, expectClientData, testData1, testData2, mergeTestData } from "./data";

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

    // Start chain and deploy contracts
    anvilProcess = startAnvil(anvilPort);
    await deployContracts(rpc);

    // Start client and browser
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

  test("should sync test data", async () => {
    await openClientWithRootAccount(page);

    // Wait for initial connection
    const blockNumber = page.locator("#block");
    await expect(blockNumber).not.toHaveText("-1");

    // Write data to the contracts, expect the client to be synced
    await setContractData(page, testData1);
    await expectClientData(page, testData1);

    // Write more data to the contracts, expect client to update
    await setContractData(page, testData2);
    await expectClientData(page, mergeTestData(testData1, testData2));

    // Reload the page, expect all data to still be set
    const currentBlockNumber = Number(await blockNumber.innerText());
    await page.reload();
    await waitForBlockNumber(currentBlockNumber);
    // await expectClientData(page, mergeTestData(testData1, testData2));

    asyncErrorHandler.expectNoAsyncErrors();
  });
});

async function waitForBlockNumber(blockNumber: number) {
  // TODO
}
