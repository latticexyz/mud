import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ViteDevServer } from "vite";
import { Browser, Page } from "@playwright/test";
import { createAsyncErrorHandler } from "./asyncErrors";
import { deployContracts, startViteServer, startBrowserAndPage, openClientWithRootAccount } from "./setup";
import { rpcHttpUrl } from "./setup/constants";
import { waitForInitialSync } from "./data/waitForInitialSync";
import { createBurnerAccount, resourceToHex, transportObserver } from "@latticexyz/common";
import { http, createWalletClient, ClientConfig, encodeFunctionData } from "viem";
import { mudFoundry } from "@latticexyz/common/chains";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { callPageFunction } from "./data/callPageFunction";
import worldConfig from "@latticexyz/world/mud.config";
import { worldToV1 } from "@latticexyz/world/config/v2";
import { callWithSignatureTypes } from "@latticexyz/world/internal";
import { getWorld } from "./data/getWorld";
import { callWithSignature } from "./data/callWithSignature";
import IWorldAbi from "../contracts/out/IWorld.sol/IWorld.abi.json";

const DELEGATOR_PRIVATE_KEY = "0x67bbd1575ecc79b3247c7d7b87a5bc533ccb6a63955a9fefdfaf75853f7cd543";

const worldConfigV1 = worldToV1(worldConfig);

describe("callWithSignature", async () => {
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

  it("can generate a signature and register a delegation", async () => {
    await openClientWithRootAccount(page);
    await waitForInitialSync(page);

    // Set up client
    const clientOptions = {
      chain: mudFoundry,
      transport: transportObserver(http(mudFoundry.rpcUrls.default.http[0] ?? undefined)),
    } as const satisfies ClientConfig;

    const delegator = createBurnerAccount(DELEGATOR_PRIVATE_KEY);
    const delegatorWalletClient = createWalletClient({
      ...clientOptions,
      account: delegator,
    });

    const worldContract = await getWorld(page);
    const systemId = resourceToHex({ type: "system", namespace: "", name: "Registration" });

    // Declare delegation parameters
    const delegatee = "0x7203e7ADfDF38519e1ff4f8Da7DCdC969371f377";
    const delegationControlId = resourceToHex({ type: "system", namespace: "", name: "unlimited" });
    const initCallData = "0x";

    const callData = encodeFunctionData({
      abi: IWorldAbi,
      functionName: "registerDelegation",
      args: [delegatee, delegationControlId, initCallData],
    });

    const nonce = 0n;

    // Sign registration call message
    const signature = await delegatorWalletClient.signTypedData({
      domain: {
        chainId: delegatorWalletClient.chain.id,
        verifyingContract: worldContract.address,
      },
      types: callWithSignatureTypes,
      primaryType: "Call",
      message: {
        signer: delegator.address,
        systemId,
        callData,
        nonce,
      },
    });

    // Register a delegation
    await callWithSignature(page, [delegator.address, systemId, callData, signature]);

    // Expect delegation to have been created
    const value = await callPageFunction(page, "getComponentValue", [
      "UserDelegationControl",
      encodeEntity(worldConfigV1.tables.UserDelegationControl.keySchema, {
        delegator: delegator.address,
        delegatee,
      }),
    ]);

    expect(value).toMatchObject({
      __staticData: delegationControlId,
      delegationControlId,
    });
  });
});
