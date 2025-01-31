// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import { rpcHttpUrl } from "./setup/constants";
import { deployContracts } from "./setup";
import { createAsyncErrorHandler } from "./asyncErrors";
import { createWorld, getComponentValueStrict } from "@latticexyz/recs";
import { singletonEntity, syncToRecs } from "@latticexyz/store-sync/recs";
import mudConfig from "../contracts/mud.config";
import { transportObserver } from "@latticexyz/common";
import { ClientConfig, createPublicClient, http, isHex } from "viem";
import { getNetworkConfig } from "../client-vanilla/src/mud/getNetworkConfig";

describe("syncToRecs", () => {
  const asyncErrorHandler = createAsyncErrorHandler();

  it("has the correct sync progress percentage", async () => {
    asyncErrorHandler.resetErrors();

    const { stdout } = await deployContracts(rpcHttpUrl);

    const [, worldAddress] = stdout.match(/worldAddress: '(0x[0-9a-f]+)'/i) ?? [];
    if (!isHex(worldAddress)) {
      throw new Error("world address not found in output, did the deploy fail?");
    }

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
      address: worldAddress,
      publicClient,
    });

    expect(getComponentValueStrict(components.SyncProgress, singletonEntity).percentage).toMatchInlineSnapshot(`
      100
    `);
  });
});
