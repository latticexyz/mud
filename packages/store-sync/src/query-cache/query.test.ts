import { beforeAll, describe, expect, it } from "vitest";
import { createHydratedStore } from "./test/createHydratedStore";
import { query } from "./query";
import { deployMockGame } from "../../test/mockGame";
import { Address } from "viem";

describe("query", async () => {
  let worldAddress: Address;
  beforeAll(async () => {
    worldAddress = await deployMockGame();
  });

  it("can get players with a position", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await query(store, {
      from: {
        Position: ["player"],
      },
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "subjects": [
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
        ],
      }
    `);
  });

  it("can get players at position (3, 5)", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await query(store, {
      from: {
        Position: ["player"],
      },
      where: [
        ["Position.x", "=", 3],
        ["Position.y", "=", 5],
      ],
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        ],
      }
    `);
  });

  it("can get players within the bounds of (-5, -5) and (5, 5)", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await query(store, {
      from: {
        Position: ["player"],
      },
      where: [
        ["Position.x", ">=", -5],
        ["Position.x", "<=", 5],
        ["Position.y", ">=", -5],
        ["Position.y", "<=", 5],
      ],
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          ],
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        ],
      }
    `);
  });

  it("can get players that are still alive", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await query(store, {
      from: {
        Position: ["player"],
        Health: ["player"],
      },
      where: [["Health.health", "!=", 0n]],
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          ],
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
        ],
      }
    `);
  });

  it("can get all players in grassland", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await query(store, {
      from: {
        Terrain: ["x", "y"],
      },
      where: [["Terrain.terrainType", "=", 2]],
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            3,
            5,
          ],
        ],
      }
    `);
  });

  it("can get all players without health (e.g. spectator)", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await query(store, {
      from: {
        Position: ["player"],
      },
      except: {
        Health: ["player"],
      },
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            "0xdBa86119a787422C593ceF119E40887f396024E2",
          ],
        ],
      }
    `);
  });
});
