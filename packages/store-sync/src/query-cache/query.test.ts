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
        {
          "id": "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
          "records": [
            {
              "fields": {
                "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
                "x": 1,
                "y": -1,
              },
              "id": "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
              "key": {
                "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              },
              "keyTuple": [
                "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
              ],
              "schema": {
                "player": {
                  "internalType": "address",
                  "type": "address",
                },
                "x": {
                  "internalType": "int32",
                  "type": "int32",
                },
                "y": {
                  "internalType": "int32",
                  "type": "int32",
                },
              },
              "subject": [
                "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              ],
              "subjectSchema": [
                {
                  "internalType": "address",
                  "type": "address",
                },
              ],
              "table": {
                "keySchema": {
                  "player": {
                    "internalType": "address",
                    "type": "address",
                  },
                },
                "name": "Position",
                "namespace": "",
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
                "valueSchema": {
                  "x": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                  "y": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                },
              },
              "value": {
                "x": 1,
                "y": -1,
              },
            },
          ],
          "subject": [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          ],
        },
        {
          "id": "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
          "records": [
            {
              "fields": {
                "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
                "x": 3,
                "y": 5,
              },
              "id": "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
              "key": {
                "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              },
              "keyTuple": [
                "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
              ],
              "schema": {
                "player": {
                  "internalType": "address",
                  "type": "address",
                },
                "x": {
                  "internalType": "int32",
                  "type": "int32",
                },
                "y": {
                  "internalType": "int32",
                  "type": "int32",
                },
              },
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                {
                  "internalType": "address",
                  "type": "address",
                },
              ],
              "table": {
                "keySchema": {
                  "player": {
                    "internalType": "address",
                    "type": "address",
                  },
                },
                "name": "Position",
                "namespace": "",
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
                "valueSchema": {
                  "x": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                  "y": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                },
              },
              "value": {
                "x": 3,
                "y": 5,
              },
            },
          ],
          "subject": [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
        },
        {
          "id": "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
          "records": [
            {
              "fields": {
                "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
                "x": 3,
                "y": 5,
              },
              "id": "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
              "key": {
                "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              },
              "keyTuple": [
                "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
              ],
              "schema": {
                "player": {
                  "internalType": "address",
                  "type": "address",
                },
                "x": {
                  "internalType": "int32",
                  "type": "int32",
                },
                "y": {
                  "internalType": "int32",
                  "type": "int32",
                },
              },
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                {
                  "internalType": "address",
                  "type": "address",
                },
              ],
              "table": {
                "keySchema": {
                  "player": {
                    "internalType": "address",
                    "type": "address",
                  },
                },
                "name": "Position",
                "namespace": "",
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
                "valueSchema": {
                  "x": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                  "y": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                },
              },
              "value": {
                "x": 3,
                "y": 5,
              },
            },
          ],
          "subject": [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        },
        {
          "id": "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
          "records": [
            {
              "fields": {
                "player": "0xdBa86119a787422C593ceF119E40887f396024E2",
                "x": 100,
                "y": 100,
              },
              "id": "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
              "key": {
                "player": "0xdBa86119a787422C593ceF119E40887f396024E2",
              },
              "keyTuple": [
                "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
              ],
              "schema": {
                "player": {
                  "internalType": "address",
                  "type": "address",
                },
                "x": {
                  "internalType": "int32",
                  "type": "int32",
                },
                "y": {
                  "internalType": "int32",
                  "type": "int32",
                },
              },
              "subject": [
                "0xdBa86119a787422C593ceF119E40887f396024E2",
              ],
              "subjectSchema": [
                {
                  "internalType": "address",
                  "type": "address",
                },
              ],
              "table": {
                "keySchema": {
                  "player": {
                    "internalType": "address",
                    "type": "address",
                  },
                },
                "name": "Position",
                "namespace": "",
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
                "valueSchema": {
                  "x": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                  "y": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                },
              },
              "value": {
                "x": 100,
                "y": 100,
              },
            },
          ],
          "subject": [
            "0xdBa86119a787422C593ceF119E40887f396024E2",
          ],
        },
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
        {
          "id": "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
          "records": [
            {
              "fields": {
                "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
                "x": 3,
                "y": 5,
              },
              "id": "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
              "key": {
                "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              },
              "keyTuple": [
                "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
              ],
              "schema": {
                "player": {
                  "internalType": "address",
                  "type": "address",
                },
                "x": {
                  "internalType": "int32",
                  "type": "int32",
                },
                "y": {
                  "internalType": "int32",
                  "type": "int32",
                },
              },
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                {
                  "internalType": "address",
                  "type": "address",
                },
              ],
              "table": {
                "keySchema": {
                  "player": {
                    "internalType": "address",
                    "type": "address",
                  },
                },
                "name": "Position",
                "namespace": "",
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
                "valueSchema": {
                  "x": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                  "y": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                },
              },
              "value": {
                "x": 3,
                "y": 5,
              },
            },
          ],
          "subject": [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
        },
        {
          "id": "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
          "records": [
            {
              "fields": {
                "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
                "x": 3,
                "y": 5,
              },
              "id": "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
              "key": {
                "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              },
              "keyTuple": [
                "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
              ],
              "schema": {
                "player": {
                  "internalType": "address",
                  "type": "address",
                },
                "x": {
                  "internalType": "int32",
                  "type": "int32",
                },
                "y": {
                  "internalType": "int32",
                  "type": "int32",
                },
              },
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                {
                  "internalType": "address",
                  "type": "address",
                },
              ],
              "table": {
                "keySchema": {
                  "player": {
                    "internalType": "address",
                    "type": "address",
                  },
                },
                "name": "Position",
                "namespace": "",
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
                "valueSchema": {
                  "x": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                  "y": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                },
              },
              "value": {
                "x": 3,
                "y": 5,
              },
            },
          ],
          "subject": [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        },
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
        {
          "id": "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
          "records": [
            {
              "fields": {
                "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
                "x": 1,
                "y": -1,
              },
              "id": "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
              "key": {
                "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              },
              "keyTuple": [
                "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
              ],
              "schema": {
                "player": {
                  "internalType": "address",
                  "type": "address",
                },
                "x": {
                  "internalType": "int32",
                  "type": "int32",
                },
                "y": {
                  "internalType": "int32",
                  "type": "int32",
                },
              },
              "subject": [
                "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              ],
              "subjectSchema": [
                {
                  "internalType": "address",
                  "type": "address",
                },
              ],
              "table": {
                "keySchema": {
                  "player": {
                    "internalType": "address",
                    "type": "address",
                  },
                },
                "name": "Position",
                "namespace": "",
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
                "valueSchema": {
                  "x": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                  "y": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                },
              },
              "value": {
                "x": 1,
                "y": -1,
              },
            },
          ],
          "subject": [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          ],
        },
        {
          "id": "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
          "records": [
            {
              "fields": {
                "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
                "x": 3,
                "y": 5,
              },
              "id": "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
              "key": {
                "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              },
              "keyTuple": [
                "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
              ],
              "schema": {
                "player": {
                  "internalType": "address",
                  "type": "address",
                },
                "x": {
                  "internalType": "int32",
                  "type": "int32",
                },
                "y": {
                  "internalType": "int32",
                  "type": "int32",
                },
              },
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                {
                  "internalType": "address",
                  "type": "address",
                },
              ],
              "table": {
                "keySchema": {
                  "player": {
                    "internalType": "address",
                    "type": "address",
                  },
                },
                "name": "Position",
                "namespace": "",
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
                "valueSchema": {
                  "x": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                  "y": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                },
              },
              "value": {
                "x": 3,
                "y": 5,
              },
            },
          ],
          "subject": [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
        },
        {
          "id": "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
          "records": [
            {
              "fields": {
                "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
                "x": 3,
                "y": 5,
              },
              "id": "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
              "key": {
                "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              },
              "keyTuple": [
                "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
              ],
              "schema": {
                "player": {
                  "internalType": "address",
                  "type": "address",
                },
                "x": {
                  "internalType": "int32",
                  "type": "int32",
                },
                "y": {
                  "internalType": "int32",
                  "type": "int32",
                },
              },
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                {
                  "internalType": "address",
                  "type": "address",
                },
              ],
              "table": {
                "keySchema": {
                  "player": {
                    "internalType": "address",
                    "type": "address",
                  },
                },
                "name": "Position",
                "namespace": "",
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
                "valueSchema": {
                  "x": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                  "y": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                },
              },
              "value": {
                "x": 3,
                "y": 5,
              },
            },
          ],
          "subject": [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        },
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
        {
          "id": "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
          "records": [
            {
              "fields": {
                "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
                "x": 1,
                "y": -1,
              },
              "id": "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
              "key": {
                "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              },
              "keyTuple": [
                "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
              ],
              "schema": {
                "player": {
                  "internalType": "address",
                  "type": "address",
                },
                "x": {
                  "internalType": "int32",
                  "type": "int32",
                },
                "y": {
                  "internalType": "int32",
                  "type": "int32",
                },
              },
              "subject": [
                "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              ],
              "subjectSchema": [
                {
                  "internalType": "address",
                  "type": "address",
                },
              ],
              "table": {
                "keySchema": {
                  "player": {
                    "internalType": "address",
                    "type": "address",
                  },
                },
                "name": "Position",
                "namespace": "",
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
                "valueSchema": {
                  "x": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                  "y": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                },
              },
              "value": {
                "x": 1,
                "y": -1,
              },
            },
            {
              "fields": {
                "health": 5n,
                "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              },
              "id": "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
              "key": {
                "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              },
              "keyTuple": [
                "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
              ],
              "schema": {
                "health": {
                  "internalType": "uint256",
                  "type": "uint256",
                },
                "player": {
                  "internalType": "address",
                  "type": "address",
                },
              },
              "subject": [
                "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              ],
              "subjectSchema": [
                {
                  "internalType": "address",
                  "type": "address",
                },
              ],
              "table": {
                "keySchema": {
                  "player": {
                    "internalType": "address",
                    "type": "address",
                  },
                },
                "name": "Health",
                "namespace": "",
                "tableId": "0x746200000000000000000000000000004865616c746800000000000000000000",
                "valueSchema": {
                  "health": {
                    "internalType": "uint256",
                    "type": "uint256",
                  },
                },
              },
              "value": {
                "health": 5n,
              },
            },
          ],
          "subject": [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          ],
        },
        {
          "id": "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
          "records": [
            {
              "fields": {
                "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
                "x": 3,
                "y": 5,
              },
              "id": "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
              "key": {
                "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              },
              "keyTuple": [
                "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
              ],
              "schema": {
                "player": {
                  "internalType": "address",
                  "type": "address",
                },
                "x": {
                  "internalType": "int32",
                  "type": "int32",
                },
                "y": {
                  "internalType": "int32",
                  "type": "int32",
                },
              },
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                {
                  "internalType": "address",
                  "type": "address",
                },
              ],
              "table": {
                "keySchema": {
                  "player": {
                    "internalType": "address",
                    "type": "address",
                  },
                },
                "name": "Position",
                "namespace": "",
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
                "valueSchema": {
                  "x": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                  "y": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                },
              },
              "value": {
                "x": 3,
                "y": 5,
              },
            },
            {
              "fields": {
                "health": 5n,
                "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              },
              "id": "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
              "key": {
                "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              },
              "keyTuple": [
                "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
              ],
              "schema": {
                "health": {
                  "internalType": "uint256",
                  "type": "uint256",
                },
                "player": {
                  "internalType": "address",
                  "type": "address",
                },
              },
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                {
                  "internalType": "address",
                  "type": "address",
                },
              ],
              "table": {
                "keySchema": {
                  "player": {
                    "internalType": "address",
                    "type": "address",
                  },
                },
                "name": "Health",
                "namespace": "",
                "tableId": "0x746200000000000000000000000000004865616c746800000000000000000000",
                "valueSchema": {
                  "health": {
                    "internalType": "uint256",
                    "type": "uint256",
                  },
                },
              },
              "value": {
                "health": 5n,
              },
            },
          ],
          "subject": [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
        },
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
        {
          "id": "0x00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000005",
          "records": [
            {
              "fields": {
                "terrainType": 2,
                "x": 3,
                "y": 5,
              },
              "id": "0x00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000005",
              "key": {
                "x": 3,
                "y": 5,
              },
              "keyTuple": [
                "0x0000000000000000000000000000000000000000000000000000000000000003",
                "0x0000000000000000000000000000000000000000000000000000000000000005",
              ],
              "schema": {
                "terrainType": {
                  "internalType": "TerrainType",
                  "type": "uint8",
                },
                "x": {
                  "internalType": "int32",
                  "type": "int32",
                },
                "y": {
                  "internalType": "int32",
                  "type": "int32",
                },
              },
              "subject": [
                3,
                5,
              ],
              "subjectSchema": [
                {
                  "internalType": "int32",
                  "type": "int32",
                },
                {
                  "internalType": "int32",
                  "type": "int32",
                },
              ],
              "table": {
                "keySchema": {
                  "x": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                  "y": {
                    "internalType": "int32",
                    "type": "int32",
                  },
                },
                "name": "Terrain",
                "namespace": "",
                "tableId": "0x746200000000000000000000000000005465727261696e000000000000000000",
                "valueSchema": {
                  "terrainType": {
                    "internalType": "TerrainType",
                    "type": "uint8",
                  },
                },
              },
              "value": {
                "terrainType": 2,
              },
            },
          ],
          "subject": [
            3,
            5,
          ],
        },
      ]
    `);
  });
});
