import { bench } from "@ark/attest";
import { syncToRecs, type SyncToRecsOptions } from "@latticexyz/store-sync/recs";
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import type { Hex, PublicClient } from "viem";
import { defineWorld } from "@latticexyz/world";
import { createWorld } from "@latticexyz/recs";

const mockOpts = { address: {} as Hex, publicClient: {} as PublicClient } as const satisfies Partial<SyncToRecsOptions>;

bench.baseline(() => {
  const config = defineWorld({
    namespace: "baseline",
    tables: {
      test: {
        schema: {
          a: "address",
        },
        key: ["a"],
      },
    },
  });

  return syncToRecs({
    world: createWorld(),
    config,
    ...mockOpts,
  });
});

bench("syncToRecs(1 table)", async () => {
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
    ...mockOpts,
  });

  return t;
}).types([4041, "instantiations"]);

bench("syncToRecs(5 tables)", async () => {
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
      Position2: {
        schema: {
          entity2: "address",
          x2: "int32",
          y2: "int32",
        },
        key: ["entity2"],
      },
      Position3: {
        schema: {
          entity3: "address",
          x3: "int32",
          y3: "int32",
        },
        key: ["entity3"],
      },
      Position4: {
        schema: {
          entity4: "address",
          x4: "int32",
          y4: "int32",
        },
        key: ["entity4"],
      },
      Position5: {
        schema: {
          entity5: "address",
          x5: "int32",
          y5: "int32",
        },
        key: ["entity5"],
      },
    },
  });

  const t = await syncToRecs({
    world: createWorld(),
    config,
    ...mockOpts,
  });

  return t;
}).types([16313, "instantiations"]);

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
    ...mockOpts,
  });

  return t;
}).types([4098, "instantiations"]);
