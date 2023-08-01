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

describe.skip("Sync from MODE", async () => {
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

  test("should sync test data", async () => {
    await openClientWithRootAccount(page, { modeUrl });
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

  test("should throw browser error if MODE is down", async () => {
    modeProcess?.kill();

    await openClientWithRootAccount(page, { modeUrl });
    await waitForInitialSync(page);

    expect(asyncErrorHandler.getErrors()).toHaveLength(1);
    expect(asyncErrorHandler.getErrors()[0]).toContain(
      "MODE Error:  ClientError: /mode.QueryLayer/GetPartialState UNKNOWN: Response closed without headers"
    );
  });

  test("should sync number list modified via system", async () => {
    await openClientWithRootAccount(page);
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
