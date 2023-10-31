import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ViteDevServer } from "vite";
import { Browser, Page } from "@playwright/test";
import { createAsyncErrorHandler } from "./asyncErrors";
import { deployContracts, startViteServer, startBrowserAndPage, openClientWithRootAccount } from "./setup";
import { range } from "@latticexyz/utils";
import { rpcHttpUrl } from "./setup/constants";
import { callPageFunction } from "./data/callPageFunction";
import { expectClientData } from "./data/expectClientData";
import { mergeTestData } from "./data/mergeTestData";
import { push, pushRange, pop } from "./data/numberListSystem";
import { setContractData } from "./data/setContractData";
import { testData1, testData2 } from "./data/testData";
import { waitForInitialSync } from "./data/waitForInitialSync";

describe("Sync from RPC", async () => {
  const asyncErrorHandler = createAsyncErrorHandler();
  let webserver: ViteDevServer;
  let browser: Browser;
  let page: Page;

  beforeEach(async () => {
    asyncErrorHandler.resetErrors();

    await deployContracts(rpcHttpUrl);

    // Start client and browser
    webserver = await startViteServer();
    const browserAndPage = await startBrowserAndPage(asyncErrorHandler.reportError);
    browser = browserAndPage.browser;
    page = browserAndPage.page;
  });

  afterEach(async () => {
    await browser.close();
    await webserver.close();
  });

  it("should sync test data", async () => {
    await openClientWithRootAccount(page);
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

  it("should sync number list modified via system", async () => {
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

  it("should only have filtered position data", async () => {
    await openClientWithRootAccount(page);
    await waitForInitialSync(page);

    expect(await callPageFunction(page, "getKeys", ["Position"])).toMatchInlineSnapshot(`
      [
        {
          "x": 1,
          "y": 1,
          "zone": "0x6d61703100000000000000000000000000000000000000000000000000000000",
        },
        {
          "x": 2,
          "y": -2,
          "zone": "0x6d61703100000000000000000000000000000000000000000000000000000000",
        },
      ]
    `);
  });
});
