import { bench } from "@ark/attest";
import { syncToRecs } from "@latticexyz/store-sync/recs";
import { Hex, type PublicClient } from "viem";
import { defineWorld } from "@latticexyz/world";
import { createWorld } from "@latticexyz/recs";

bench("SyncToRecs", async () => {
  const world = createWorld();
  const config = defineWorld({
    namespace: "demo",
    tables: {
      Position: {
        schema: {
          entity: "address",
          x: "int32",
          y: "int32",
        },
        key: ["entity"],
      },
    },
  });

  const t = await syncToRecs({
    world,
    config,
    address: {} as Hex,
    publicClient: {} as PublicClient,
    startBlock: 0n,
  });

  return t;
}).types([21758, "instantiations"]);
