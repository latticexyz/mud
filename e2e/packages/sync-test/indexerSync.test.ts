import { afterEach, beforeEach, describe, test } from "vitest";
import type { ViteDevServer } from "vite";
import { expect, Browser, Page } from "@playwright/test";
import { ExecaChildProcess } from "execa";
import { createAsyncErrorHandler } from "./asyncErrors";
import {
  deployContracts,
  startViteServer,
  startBrowserAndPage,
  startIndexer,
  openClientWithRootAccount,
} from "./setup";
import {
  setContractData,
  expectClientData,
  testData1,
  mergeTestData,
  testData2,
  waitForInitialSync,
  push,
  pushRange,
  pop,
} from "./data";
import { range } from "@latticexyz/utils";
import path from "node:path";
import { rpcHttpUrl } from "./setup/constants";

describe("Sync from indexer", async () => {
  const asyncErrorHandler = createAsyncErrorHandler();
  let webserver: ViteDevServer;
  let browser: Browser;
  let page: Page;
  let indexer: ReturnType<typeof startIndexer>;
  const indexerUrl = "http://localhost:3001";

  beforeEach(async () => {
    await deployContracts(rpcHttpUrl);

    // Start client and browser
    webserver = await startViteServer();
    const browserAndPage = await startBrowserAndPage(asyncErrorHandler.reportError);
    browser = browserAndPage.browser;
    page = browserAndPage.page;

    // Start indexer
    indexer = startIndexer(path.join(__dirname, "anvil.db"), rpcHttpUrl, asyncErrorHandler.reportError);
    await indexer.doneSyncing;
  });

  afterEach(async () => {
    await browser.close();
    await webserver.close();
    await indexer.kill();
    asyncErrorHandler.resetErrors();
  });

  test("should sync test data", async () => {
    await openClientWithRootAccount(page, { indexerUrl });
    await waitForInitialSync(page);

    // Write data to the contracts, expect the client to be synced
    await setContractData(page, testData1);
    await expectClientData(page, testData1);

    // Write more data to the contracts, expect client to update
    await setContractData(page, testData2);
    await expectClientData(page, mergeTestData(testData1, testData2));

    // Reload the page, expect all data to still be set
    await page.reload();
    await waitForInitialSync(page);
    await expectClientData(page, mergeTestData(testData1, testData2));

    asyncErrorHandler.expectNoAsyncErrors();
  });

  test("should log error if indexer is down", async () => {
    await indexer.kill();

    await openClientWithRootAccount(page, { indexerUrl });
    await waitForInitialSync(page);

    expect(asyncErrorHandler.getErrors()).toHaveLength(1);
    expect(asyncErrorHandler.getErrors()[0]).toContain("couldn't get initial state from indexer");
  });

  test("should sync number list modified via system", async () => {
    await openClientWithRootAccount(page, { indexerUrl });
    await waitForInitialSync(page);

    // Push one element to the array
    await push(page, 42);
    await expectClientData(page, { NumberList: [{ key: {}, value: { value: [42] } }] });

    // Push 5000 elements to the array
    await pushRange(page, 0, 5000);
    await expectClientData(page, { NumberList: [{ key: {}, value: { value: [42, ...range(5000, 1, 0)] } }] });

    // Pop one element from the array
    await pop(page);
    await expectClientData(page, { NumberList: [{ key: {}, value: { value: [42, ...range(4999, 1, 0)] } }] });

    // Should not have thrown errors
    asyncErrorHandler.expectNoAsyncErrors();
  });
});
