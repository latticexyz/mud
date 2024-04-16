import { beforeAll, describe, expect, it } from "vitest";
import { createHydratedStore } from "./test/createHydratedStore";
import { query } from "./query";
import { deployMockGame } from "../../test/mockGame";
import { Address } from "viem";

describe.skip("query", async () => {
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
          {
            "records": [
              {
                "fields": {
                  "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
                  "x": 1,
                  "y": -1,
                },
                "keyTuple": [
                  "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
                ],
                "primaryKey": [
                  "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
            ],
            "subject": [
              "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
            ],
            "subjectSchema": [
              "address",
            ],
          },
          {
            "records": [
              {
                "fields": {
                  "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
                ],
                "primaryKey": [
                  "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
            ],
            "subject": [
              "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            ],
            "subjectSchema": [
              "address",
            ],
          },
          {
            "records": [
              {
                "fields": {
                  "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
                ],
                "primaryKey": [
                  "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
            ],
            "subject": [
              "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
            ],
            "subjectSchema": [
              "address",
            ],
          },
          {
            "records": [
              {
                "fields": {
                  "player": "0xdBa86119a787422C593ceF119E40887f396024E2",
                  "x": 100,
                  "y": 100,
                },
                "keyTuple": [
                  "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
                ],
                "primaryKey": [
                  "0xdBa86119a787422C593ceF119E40887f396024E2",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
            ],
            "subject": [
              "0xdBa86119a787422C593ceF119E40887f396024E2",
            ],
            "subjectSchema": [
              "address",
            ],
          },
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
          {
            "records": [
              {
                "fields": {
                  "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
                ],
                "primaryKey": [
                  "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
            ],
            "subject": [
              "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            ],
            "subjectSchema": [
              "address",
            ],
          },
          {
            "records": [
              {
                "fields": {
                  "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
                ],
                "primaryKey": [
                  "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
            ],
            "subject": [
              "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
            ],
            "subjectSchema": [
              "address",
            ],
          },
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
          {
            "records": [
              {
                "fields": {
                  "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
                  "x": 1,
                  "y": -1,
                },
                "keyTuple": [
                  "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
                ],
                "primaryKey": [
                  "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
            ],
            "subject": [
              "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
            ],
            "subjectSchema": [
              "address",
            ],
          },
          {
            "records": [
              {
                "fields": {
                  "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
                ],
                "primaryKey": [
                  "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
            ],
            "subject": [
              "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            ],
            "subjectSchema": [
              "address",
            ],
          },
          {
            "records": [
              {
                "fields": {
                  "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
                ],
                "primaryKey": [
                  "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
            ],
            "subject": [
              "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
            ],
            "subjectSchema": [
              "address",
            ],
          },
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
          {
            "records": [
              {
                "fields": {
                  "health": 5n,
                  "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
                },
                "keyTuple": [
                  "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
                ],
                "primaryKey": [
                  "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
                ],
                "tableId": "0x746200000000000000000000000000004865616c746800000000000000000000",
              },
            ],
            "subject": [
              "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
            ],
            "subjectSchema": [
              "address",
            ],
          },
          {
            "records": [
              {
                "fields": {
                  "health": 5n,
                  "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
                },
                "keyTuple": [
                  "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
                ],
                "primaryKey": [
                  "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
                ],
                "tableId": "0x746200000000000000000000000000004865616c746800000000000000000000",
              },
            ],
            "subject": [
              "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            ],
            "subjectSchema": [
              "address",
            ],
          },
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
          {
            "records": [
              {
                "fields": {
                  "terrainType": 2,
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x0000000000000000000000000000000000000000000000000000000000000003",
                  "0x0000000000000000000000000000000000000000000000000000000000000005",
                ],
                "primaryKey": [
                  3,
                  5,
                ],
                "tableId": "0x746200000000000000000000000000005465727261696e000000000000000000",
              },
            ],
            "subject": [
              3,
              5,
            ],
            "subjectSchema": [
              "int32",
              "int32",
            ],
          },
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
          {
            "records": [
              {
                "fields": {
                  "player": "0xdBa86119a787422C593ceF119E40887f396024E2",
                  "x": 100,
                  "y": 100,
                },
                "keyTuple": [
                  "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
                ],
                "primaryKey": [
                  "0xdBa86119a787422C593ceF119E40887f396024E2",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
            ],
            "subject": [
              "0xdBa86119a787422C593ceF119E40887f396024E2",
            ],
            "subjectSchema": [
              "address",
            ],
          },
        ],
      }
    `);
  });
});
