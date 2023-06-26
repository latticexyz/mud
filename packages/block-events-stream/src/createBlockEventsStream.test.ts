import { describe, expect, it } from "vitest";
import { createBlockEventsStream } from "./createBlockEventsStream";
import { createPublicClient, createTestClient, http } from "viem";
import { foundry } from "viem/chains";
import { storeEventsAbi } from "@latticexyz/store";
import { createAnvil } from "@viem/anvil";

describe("createBlockEventsStream", () => {
  it("streams events grouped by block", async () => {
    const anvil = createAnvil();
    await anvil.start();

    const publicClient = createPublicClient({
      chain: foundry,
      transport: http(),
    });

    const testClient = createTestClient({
      chain: foundry,
      mode: "anvil",
      transport: http(),
    });

    const block$ = await createBlockEventsStream({ publicClient, events: storeEventsAbi });

    await anvil.stop();
  });
});
