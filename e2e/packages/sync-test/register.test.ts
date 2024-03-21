import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ViteDevServer } from "vite";
import { Browser, Page } from "@playwright/test";
import { createAsyncErrorHandler } from "./asyncErrors";
import { deployContracts, startViteServer, startBrowserAndPage, openClientWithRootAccount } from "./setup";
import { rpcHttpUrl } from "./setup/constants";
import { waitForInitialSync } from "./data/waitForInitialSync";
import { callWorld } from "./data/callWorld";
import { createBurnerAccount, resourceToHex, transportObserver } from "@latticexyz/common";
import { http, createWalletClient, ClientConfig } from "viem";
import { mudFoundry } from "@latticexyz/common/chains";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { callPageFunction } from "./data/callPageFunction";

describe("register", async () => {
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

  it("call the world", async () => {
    await openClientWithRootAccount(page);
    await waitForInitialSync(page);

    const delegatee = "0x7203e7ADfDF38519e1ff4f8Da7DCdC969371f377";
    const delegationControlId = resourceToHex({ type: "system", namespace: "", name: "unlimited" });
    const initCallData = "0x";
    const nonce = 0n;

    const domain = {
      name: "App Name",
      version: "1",
      chainId: 1,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    } as const;

    const types = {
      Delegation: [
        { name: "delegatee", type: "address" },
        { name: "delegationControlId", type: "bytes32" },
        { name: "initCallData", type: "bytes" },
        { name: "nonce", type: "uint256" },
      ],
    } as const;

    const clientOptions = {
      chain: mudFoundry,
      transport: transportObserver(http(mudFoundry.rpcUrls.default.http[0] ?? undefined)),
      pollingInterval: 1000,
    } as const satisfies ClientConfig;

    const burnerAccount = createBurnerAccount("0x545824f54a7894601d34d6bb40a3dbb88064d3528a222914858fb32af616b89e");
    const walletClient = createWalletClient({
      ...clientOptions,
      account: burnerAccount,
    });

    const signature = await walletClient.signTypedData({
      domain,
      types,
      primaryType: "Delegation",
      message: {
        delegatee,
        delegationControlId,
        initCallData,
        nonce,
      },
    });

    await callWorld(page, "registerDelegationWithSignature", [
      delegatee,
      delegationControlId,
      initCallData,
      walletClient.account.address,
      signature,
    ]);

    // Expect delegation to have been created
    const value = await callPageFunction(page, "getEntities", ["UserDelegationNonces"]);
    expect(value[0]).toEqual(encodeEntity({ address: "address" }, { address: burnerAccount.address }));
  });
});
