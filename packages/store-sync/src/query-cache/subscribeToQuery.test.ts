import { beforeAll, describe, expect, it } from "vitest";
import { createHydratedStore } from "./test/createHydratedStore";
import { subscribeToQuery } from "./subscribeToQuery";
import { deployMockGame, worldAbi } from "../../test/mockGame";
import { writeContract } from "viem/actions";
import { Address, keccak256, parseEther, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { testClient } from "../../test/common";
import { combineLatest, filter, firstValueFrom, map, scan, shareReplay } from "rxjs";
import { waitForTransaction } from "./test/waitForTransaction";
import { SubjectEvent, SubjectRecord } from "@latticexyz/query";

const henryAccount = privateKeyToAccount(keccak256(stringToHex("henry")));

describe.skip("subscribeToQuery", async () => {
  let worldAddress: Address;
  beforeAll(async () => {
    await testClient.setBalance({ address: henryAccount.address, value: parseEther("1") });
    worldAddress = await deployMockGame();
  });

  it("can get players with a position", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects$, subjectEvents$ } = subscribeToQuery(store, {
      from: {
        Position: ["player"],
      },
    });

    const latest$ = combineLatest({
      subjects$: subjects$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectRecord[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      subjectEvents$: subjectEvents$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectEvent[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 1,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
            {
              "record": {
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
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
            {
              "record": {
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
              "subject": [
                "0xdBa86119a787422C593ceF119E40887f396024E2",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
          ],
        },
        "subjects$": {
          "count": 1,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0xdBa86119a787422C593ceF119E40887f396024E2",
              ],
              "subjectSchema": [
                "address",
              ],
            },
          ],
        },
      }
    `);

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [1, 2],
      }),
    );
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 2,
          "value": [
            {
              "record": {
                "fields": {
                  "player": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                  "x": 1,
                  "y": 2,
                },
                "keyTuple": [
                  "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
                ],
                "primaryKey": [
                  "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
              "subject": [
                "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
          ],
        },
        "subjects$": {
          "count": 2,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0xdBa86119a787422C593ceF119E40887f396024E2",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
                "fields": {
                  "player": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                  "x": 1,
                  "y": 2,
                },
                "keyTuple": [
                  "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
                ],
                "primaryKey": [
                  "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
              "subject": [
                "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              ],
              "subjectSchema": [
                "address",
              ],
            },
          ],
        },
      }
    `);
  });

  it("can get players at position (3, 5)", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects$, subjectEvents$ } = subscribeToQuery(store, {
      from: {
        Position: ["player"],
      },
      where: [
        ["Position.x", "=", 3],
        ["Position.y", "=", 5],
      ],
    });

    const latest$ = combineLatest({
      subjects$: subjects$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectRecord[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      subjectEvents$: subjectEvents$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectEvent[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 1,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
            {
              "record": {
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
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
          ],
        },
        "subjects$": {
          "count": 1,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                "address",
              ],
            },
          ],
        },
      }
    `);

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [3, 5],
      }),
    );
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 2,
          "value": [
            {
              "record": {
                "fields": {
                  "player": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
                ],
                "primaryKey": [
                  "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
              "subject": [
                "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
          ],
        },
        "subjects$": {
          "count": 2,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
                "fields": {
                  "player": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
                ],
                "primaryKey": [
                  "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
              "subject": [
                "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              ],
              "subjectSchema": [
                "address",
              ],
            },
          ],
        },
      }
    `);

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [2, 4],
      }),
    );
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 3,
          "value": [
            {
              "record": {
                "fields": {
                  "player": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
                ],
                "primaryKey": [
                  "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
              "subject": [
                "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "exit",
            },
          ],
        },
        "subjects$": {
          "count": 3,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                "address",
              ],
            },
          ],
        },
      }
    `);
  });

  it("can get players within the bounds of (-5, -5) and (5, 5)", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects$, subjectEvents$ } = subscribeToQuery(store, {
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

    const latest$ = combineLatest({
      subjects$: subjects$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectRecord[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      subjectEvents$: subjectEvents$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectEvent[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 1,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
            {
              "record": {
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
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
          ],
        },
        "subjects$": {
          "count": 1,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                "address",
              ],
            },
          ],
        },
      }
    `);

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [3, 5],
      }),
    );
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 2,
          "value": [
            {
              "record": {
                "fields": {
                  "player": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
                ],
                "primaryKey": [
                  "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
              "subject": [
                "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
          ],
        },
        "subjects$": {
          "count": 2,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
                "fields": {
                  "player": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
                ],
                "primaryKey": [
                  "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
              "subject": [
                "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              ],
              "subjectSchema": [
                "address",
              ],
            },
          ],
        },
      }
    `);

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [100, 100],
      }),
    );
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 3,
          "value": [
            {
              "record": {
                "fields": {
                  "player": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
                ],
                "primaryKey": [
                  "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
              "subject": [
                "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "exit",
            },
          ],
        },
        "subjects$": {
          "count": 3,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                "address",
              ],
            },
          ],
        },
      }
    `);
  });

  it("can get players that are still alive", async () => {
    const { store } = await createHydratedStore(worldAddress);

    const { subjects$, subjectEvents$ } = subscribeToQuery(store, {
      from: {
        Position: ["player"],
        Health: ["player"],
      },
      where: [["Health.health", "!=", 0n]],
    });

    const latest$ = combineLatest({
      subjects$: subjects$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectRecord[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      subjectEvents$: subjectEvents$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectEvent[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 1,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
          ],
        },
        "subjects$": {
          "count": 1,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
            },
          ],
        },
      }
    `);
  });

  it("can get all players in grassland", async () => {
    const { store } = await createHydratedStore(worldAddress);

    const { subjects$, subjectEvents$ } = subscribeToQuery(store, {
      from: {
        Terrain: ["x", "y"],
      },
      where: [["Terrain.terrainType", "=", 2]],
    });

    const latest$ = combineLatest({
      subjects$: subjects$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectRecord[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      subjectEvents$: subjectEvents$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectEvent[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 1,
          "value": [
            {
              "record": {
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
              "subject": [
                3,
                5,
              ],
              "subjectSchema": [
                "int32",
                "int32",
              ],
              "type": "enter",
            },
          ],
        },
        "subjects$": {
          "count": 1,
          "value": [
            {
              "record": {
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
        },
      }
    `);
  });

  it("can get all players without health (e.g. spectator)", async () => {
    const { store } = await createHydratedStore(worldAddress);

    const { subjects$, subjectEvents$ } = subscribeToQuery(store, {
      from: {
        Position: ["player"],
      },
      except: {
        Health: ["player"],
      },
    });

    const latest$ = combineLatest({
      subjects$: subjects$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectRecord[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      subjectEvents$: subjectEvents$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectEvent[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 1,
          "value": [
            {
              "record": {
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
              "subject": [
                "0xdBa86119a787422C593ceF119E40887f396024E2",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
          ],
        },
        "subjects$": {
          "count": 1,
          "value": [
            {
              "record": {
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
              "subject": [
                "0xdBa86119a787422C593ceF119E40887f396024E2",
              ],
              "subjectSchema": [
                "address",
              ],
            },
          ],
        },
      }
    `);
  });

  it("emits new subjects when initial matching set is empty", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects$, subjectEvents$ } = subscribeToQuery(store, {
      from: {
        Position: ["player"],
      },
      where: [
        ["Position.x", "=", 999],
        ["Position.y", "=", 999],
      ],
    });

    const latest$ = combineLatest({
      subjects$: subjects$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectRecord[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      subjectEvents$: subjectEvents$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectEvent[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 1,
          "value": [],
        },
        "subjects$": {
          "count": 1,
          "value": [],
        },
      }
    `);

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [999, 999],
      }),
    );
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 2,
          "value": [
            {
              "record": {
                "fields": {
                  "player": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                  "x": 999,
                  "y": 999,
                },
                "keyTuple": [
                  "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
                ],
                "primaryKey": [
                  "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
              "subject": [
                "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
          ],
        },
        "subjects$": {
          "count": 2,
          "value": [
            {
              "record": {
                "fields": {
                  "player": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                  "x": 999,
                  "y": 999,
                },
                "keyTuple": [
                  "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
                ],
                "primaryKey": [
                  "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
              "subject": [
                "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              ],
              "subjectSchema": [
                "address",
              ],
            },
          ],
        },
      }
    `);
  });

  it("emits changed subjects when subscribing some time after initial query", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects, subjects$, subjectEvents$ } = subscribeToQuery(store, {
      from: {
        Position: ["player"],
      },
      where: [
        ["Position.x", "=", 3],
        ["Position.y", "=", 5],
      ],
    });

    expect(await subjects).toMatchInlineSnapshot(`
      [
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
      ]
    `);

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [3, 5],
      }),
    );
    await fetchLatestLogs();

    const latest$ = combineLatest({
      subjects$: subjects$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectRecord[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      subjectEvents$: subjectEvents$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly SubjectEvent[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    // we expect two emissions for by this point: initial subjects + subjects changed since starting the subscriptions
    expect(
      await firstValueFrom(
        latest$.pipe(filter((latest) => latest.subjects$.count === 2 && latest.subjectEvents$.count === 2)),
      ),
    ).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 2,
          "value": [
            {
              "record": {
                "fields": {
                  "player": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
                ],
                "primaryKey": [
                  "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
              "subject": [
                "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "enter",
            },
          ],
        },
        "subjects$": {
          "count": 2,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
                "fields": {
                  "player": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
                ],
                "primaryKey": [
                  "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
              "subject": [
                "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              ],
              "subjectSchema": [
                "address",
              ],
            },
          ],
        },
      }
    `);

    waitForTransaction(
      await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [2, 4],
      }),
    );
    await fetchLatestLogs();

    expect(
      await firstValueFrom(
        latest$.pipe(filter((latest) => latest.subjects$.count === 3 && latest.subjectEvents$.count === 3)),
      ),
    ).toMatchInlineSnapshot(`
      {
        "subjectEvents$": {
          "count": 3,
          "value": [
            {
              "record": {
                "fields": {
                  "player": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                  "x": 3,
                  "y": 5,
                },
                "keyTuple": [
                  "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
                ],
                "primaryKey": [
                  "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
                ],
                "tableId": "0x74620000000000000000000000000000506f736974696f6e0000000000000000",
              },
              "subject": [
                "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              ],
              "subjectSchema": [
                "address",
              ],
              "type": "exit",
            },
          ],
        },
        "subjects$": {
          "count": 3,
          "value": [
            {
              "record": {
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
              "subject": [
                "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              ],
              "subjectSchema": [
                "address",
              ],
            },
            {
              "record": {
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
              "subject": [
                "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              ],
              "subjectSchema": [
                "address",
              ],
            },
          ],
        },
      }
    `);
  });
});
