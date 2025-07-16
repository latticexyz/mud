import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { storeEventsAbi } from "@latticexyz/store";
import { createStorageAdapter } from "./createStorageAdapter";
import { createStore } from "./createStore";
import { config, deployMockGame } from "mock-game-contracts";
import { fetchAndStoreLogs } from "../fetchAndStoreLogs";
import { getBlockNumber } from "viem/actions";
import { createTestClient, snapshotAnvilState } from "with-anvil";

describe("createStorageAdapter", async () => {
  beforeEach(snapshotAnvilState);

  beforeAll(async () => {
    await deployMockGame();
  });

  it("sets component values from logs", async () => {
    const testClient = createTestClient();
    const useStore = createStore({ tables: config.tables });
    const storageAdapter = createStorageAdapter({ store: useStore });

    console.log("fetching blocks");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const block of fetchAndStoreLogs({
      storageAdapter,
      publicClient: testClient,
      events: storeEventsAbi,
      fromBlock: 0n,
      toBlock: await getBlockNumber(testClient),
    })) {
      // console.log("got block", block.blockNumber);
    }

    expect(useStore.getState().getRecords(config.tables.Position)).toMatchInlineSnapshot(`
      {
        "0x74620000000000000000000000000000506f736974696f6e0000000000000000:0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb": {
          "fields": {
            "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
            "x": 3,
            "y": 5,
          },
          "id": "0x74620000000000000000000000000000506f736974696f6e0000000000000000:0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
          "key": {
            "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          },
          "keyTuple": [
            "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
          ],
          "table": {
            "codegen": {
              "dataStruct": true,
              "outputDirectory": "tables",
              "storeArgument": false,
              "tableIdArgument": false,
            },
            "deploy": {
              "disabled": false,
            },
            "key": [
              "player",
            ],
            "label": "Position",
            "name": "Position",
            "namespace": "",
            "namespaceLabel": "",
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
            "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
            "type": "table",
          },
          "value": {
            "x": 3,
            "y": 5,
          },
        },
        "0x74620000000000000000000000000000506f736974696f6e0000000000000000:0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e": {
          "fields": {
            "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
            "x": 1,
            "y": -1,
          },
          "id": "0x74620000000000000000000000000000506f736974696f6e0000000000000000:0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
          "key": {
            "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          },
          "keyTuple": [
            "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
          ],
          "table": {
            "codegen": {
              "dataStruct": true,
              "outputDirectory": "tables",
              "storeArgument": false,
              "tableIdArgument": false,
            },
            "deploy": {
              "disabled": false,
            },
            "key": [
              "player",
            ],
            "label": "Position",
            "name": "Position",
            "namespace": "",
            "namespaceLabel": "",
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
            "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
            "type": "table",
          },
          "value": {
            "x": 1,
            "y": -1,
          },
        },
        "0x74620000000000000000000000000000506f736974696f6e0000000000000000:0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6": {
          "fields": {
            "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            "x": 3,
            "y": 5,
          },
          "id": "0x74620000000000000000000000000000506f736974696f6e0000000000000000:0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
          "key": {
            "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          },
          "keyTuple": [
            "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
          ],
          "table": {
            "codegen": {
              "dataStruct": true,
              "outputDirectory": "tables",
              "storeArgument": false,
              "tableIdArgument": false,
            },
            "deploy": {
              "disabled": false,
            },
            "key": [
              "player",
            ],
            "label": "Position",
            "name": "Position",
            "namespace": "",
            "namespaceLabel": "",
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
            "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
            "type": "table",
          },
          "value": {
            "x": 3,
            "y": 5,
          },
        },
        "0x74620000000000000000000000000000506f736974696f6e0000000000000000:0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2": {
          "fields": {
            "player": "0xdBa86119a787422C593ceF119E40887f396024E2",
            "x": 100,
            "y": 100,
          },
          "id": "0x74620000000000000000000000000000506f736974696f6e0000000000000000:0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
          "key": {
            "player": "0xdBa86119a787422C593ceF119E40887f396024E2",
          },
          "keyTuple": [
            "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
          ],
          "table": {
            "codegen": {
              "dataStruct": true,
              "outputDirectory": "tables",
              "storeArgument": false,
              "tableIdArgument": false,
            },
            "deploy": {
              "disabled": false,
            },
            "key": [
              "player",
            ],
            "label": "Position",
            "name": "Position",
            "namespace": "",
            "namespaceLabel": "",
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
            "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
            "type": "table",
          },
          "value": {
            "x": 100,
            "y": 100,
          },
        },
      }
    `);

    expect(useStore.getState().getValue(config.tables.Terrain, { x: 3, y: 5 })).toMatchInlineSnapshot(`
      {
        "terrainType": 2,
      }
    `);
  });
});
