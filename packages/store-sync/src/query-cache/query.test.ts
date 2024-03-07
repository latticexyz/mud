import { beforeEach, describe, expect, it } from "vitest";
import { createHydratedStore, tables } from "./test/createHydratedStore";
import { query } from "./query";
import { deployMockGame } from "../../test/mockGame";
import { testClient } from "../../test/common";

describe("query", async () => {
  const worldAddress = await deployMockGame();

  beforeEach(async () => {
    const state = await testClient.dumpState();
    return async (): Promise<void> => {
      await testClient.loadState({ state });
    };
  });

  it("can get players with a position", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await query(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
    });

    expect(result).toMatchInlineSnapshot(`
      [
        [
          "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
        ],
        [
          "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
        ],
        [
          "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
        ],
        [
          "0xdBa86119a787422C593ceF119E40887f396024E2",
        ],
      ]
    `);
  });

  it("can get players at position (3, 5)", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await query(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
      where: [
        { left: { tableId: tables.Position.tableId, field: "x" }, op: "=", right: 3 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: "=", right: 5 },
      ],
    });

    expect(result).toMatchInlineSnapshot(`
      [
        [
          "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
        ],
        [
          "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
        ],
      ]
    `);
  });

  it("can get players within the bounds of (-5, -5) and (5, 5)", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await query(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
      where: [
        { left: { tableId: tables.Position.tableId, field: "x" }, op: ">=", right: -5 },
        { left: { tableId: tables.Position.tableId, field: "x" }, op: "<=", right: 5 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: ">=", right: -5 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: "<=", right: 5 },
      ],
    });

    expect(result).toMatchInlineSnapshot(`
      [
        [
          "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
        ],
        [
          "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
        ],
        [
          "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
        ],
      ]
    `);
  });

  it("can get players that are still alive", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await query(store, {
      from: [
        { tableId: tables.Position.tableId, subject: ["player"] },
        { tableId: tables.Health.tableId, subject: ["player"] },
      ],
      where: [{ left: { tableId: tables.Health.tableId, field: "health" }, op: "!=", right: 0n }],
    });

    expect(result).toMatchInlineSnapshot(`
      [
        [
          "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
        ],
        [
          "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
        ],
      ]
    `);
  });

  it("can get all players in grassland", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await query(store, {
      from: [{ tableId: tables.Terrain.tableId, subject: ["x", "y"] }],
      where: [{ left: { tableId: tables.Terrain.tableId, field: "terrainType" }, op: "=", right: 2 }],
    });

    expect(result).toMatchInlineSnapshot(`
      [
        [
          3,
          5,
        ],
      ]
    `);
  });
});
