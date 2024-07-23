import { bench } from "@arktype/attest";
import { syncToRecs } from "@latticexyz/store-sync/recs";
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import { Hex, type PublicClient } from "viem";
import { defineWorld } from "@latticexyz/world";
import { createWorld } from "@latticexyz/recs";

bench("syncToRecs", async () => {
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
    world: createWorld(),
    config,
    address: {} as Hex,
    publicClient: {} as PublicClient,
  });

  return t;
}).types([21231, "instantiations"]);

bench("syncToZustand", async () => {
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

  const t = await syncToZustand({
    config,
    address: {} as Hex,
    publicClient: {} as PublicClient,
  });

  return t;
}).types([21214, "instantiations"]);
