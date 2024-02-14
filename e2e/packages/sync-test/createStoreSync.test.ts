import { describe, expect, it } from "vitest";
import { rpcHttpUrl } from "./setup/constants";
import { deployContracts } from "./setup";
import { createAsyncErrorHandler } from "./asyncErrors";
import { createWorld, getComponentValueStrict } from "@latticexyz/recs";
import { singletonEntity, syncToRecs } from "@latticexyz/store-sync/recs";
import mudConfig from "../contracts/mud.config";
import { transportObserver } from "@latticexyz/common";
import { ClientConfig, createPublicClient, http } from "viem";
import { getNetworkConfig } from "../client-vanilla/src/mud/getNetworkConfig";

const address = "0xad97505a508daf984fe60302109e0115e544b267";

describe("createStoreSync", () => {
  const asyncErrorHandler = createAsyncErrorHandler();

  it("creates the sync", async () => {
    asyncErrorHandler.resetErrors();

    await deployContracts(rpcHttpUrl);

    const networkConfig = await getNetworkConfig();
    const clientOptions = {
      chain: networkConfig.chain,
      transport: transportObserver(http(rpcHttpUrl ?? undefined)),
      pollingInterval: 1000,
    } as const satisfies ClientConfig;

    const publicClient = createPublicClient(clientOptions);

    const world = createWorld();
    const { components } = await syncToRecs({
      world,
      config: mudConfig,
      address,
      publicClient,
    });

    expect(getComponentValueStrict(components.SyncProgress, singletonEntity).percentage).toMatchInlineSnapshot(`
      100
    `);
  });
});
