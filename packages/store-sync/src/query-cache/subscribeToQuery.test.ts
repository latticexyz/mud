import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createHydratedStore, tables } from "./test/createHydratedStore";
import { subscribeToQuery } from "./subscribeToQuery";
import { deployMockGame, worldAbi } from "../../test/mockGame";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { Address, keccak256, parseEther, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { testClient } from "../../test/common";
import { combineLatest, firstValueFrom, scan, shareReplay } from "rxjs";

const henryAccount = privateKeyToAccount(keccak256(stringToHex("henry")));

describe("subscribeToQuery", async () => {
  let worldAddress: Address;

  beforeAll(async () => {
    await testClient.setBalance({ address: henryAccount.address, value: parseEther("1") });
    worldAddress = await deployMockGame();
  });

  beforeEach(async () => {
    const state = await testClient.dumpState();
    return async (): Promise<void> => {
      await testClient.loadState({ state });
    };
  });

  it("can get players with a position", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects, subjects$, subjectChanges$ } = await subscribeToQuery(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
    });

    const latest$ = combineLatest({
      subjects: subjects$,
      subjectsObserved: subjects$.pipe(scan((count) => count + 1, 0)),
      subjectChanges: subjectChanges$,
      subjectChangesObserved: subjects$.pipe(scan((count) => count + 1, 0)),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
            ],
            "type": "enter",
          },
          {
            "subject": [
              "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            ],
            "type": "enter",
          },
          {
            "subject": [
              "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
            ],
            "type": "enter",
          },
          {
            "subject": [
              "0xdBa86119a787422C593ceF119E40887f396024E2",
            ],
            "type": "enter",
          },
        ],
        "subjectChangesObserved": 1,
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
        "subjectsObserved": 1,
      }
    `);

    await waitForTransactionReceipt(testClient, {
      hash: await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [1, 2],
      }),
    });
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
            ],
            "type": "enter",
          },
        ],
        "subjectChangesObserved": 2,
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
          [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
        ],
        "subjectsObserved": 2,
      }
    `);
  });

  it("can get players at position (3, 5)", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects, subjects$, subjectChanges$ } = await subscribeToQuery(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
      where: [
        { left: { tableId: tables.Position.tableId, field: "x" }, op: "=", right: 3 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: "=", right: 5 },
      ],
    });

    const latest$ = combineLatest({
      subjects: subjects$,
      subjectsObserved: subjects$.pipe(scan((count) => count + 1, 0)),
      subjectChanges: subjectChanges$,
      subjectChangesObserved: subjects$.pipe(scan((count) => count + 1, 0)),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            ],
            "type": "enter",
          },
          {
            "subject": [
              "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
            ],
            "type": "enter",
          },
        ],
        "subjectChangesObserved": 1,
        "subjects": [
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        ],
        "subjectsObserved": 1,
      }
    `);

    await waitForTransactionReceipt(testClient, {
      hash: await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [3, 5],
      }),
    });
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
            ],
            "type": "enter",
          },
        ],
        "subjectChangesObserved": 2,
        "subjects": [
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
          [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
        ],
        "subjectsObserved": 2,
      }
    `);

    await waitForTransactionReceipt(testClient, {
      hash: await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [2, 4],
      }),
    });
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
            ],
            "type": "exit",
          },
        ],
        "subjectChangesObserved": 3,
        "subjects": [
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        ],
        "subjectsObserved": 3,
      }
    `);
  });

  it("can get players within the bounds of (-5, -5) and (5, 5)", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects, subjects$, subjectChanges$ } = await subscribeToQuery(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
      where: [
        { left: { tableId: tables.Position.tableId, field: "x" }, op: ">=", right: -5 },
        { left: { tableId: tables.Position.tableId, field: "x" }, op: "<=", right: 5 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: ">=", right: -5 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: "<=", right: 5 },
      ],
    });

    const latest$ = combineLatest({
      subjects: subjects$,
      subjectsObserved: subjects$.pipe(scan((count) => count + 1, 0)),
      subjectChanges: subjectChanges$,
      subjectChangesObserved: subjects$.pipe(scan((count) => count + 1, 0)),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
            ],
            "type": "enter",
          },
          {
            "subject": [
              "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            ],
            "type": "enter",
          },
          {
            "subject": [
              "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
            ],
            "type": "enter",
          },
        ],
        "subjectChangesObserved": 1,
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
        "subjectsObserved": 1,
      }
    `);

    await waitForTransactionReceipt(testClient, {
      hash: await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [3, 5],
      }),
    });
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
            ],
            "type": "enter",
          },
        ],
        "subjectChangesObserved": 2,
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
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
        ],
        "subjectsObserved": 2,
      }
    `);

    await waitForTransactionReceipt(testClient, {
      hash: await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [100, 100],
      }),
    });
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
            ],
            "type": "exit",
          },
        ],
        "subjectChangesObserved": 3,
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
        "subjectsObserved": 3,
      }
    `);
  });

  it("can get players that are still alive", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects, subjects$, subjectChanges$ } = await subscribeToQuery(store, {
      from: [
        { tableId: tables.Position.tableId, subject: ["player"] },
        { tableId: tables.Health.tableId, subject: ["player"] },
      ],
      where: [{ left: { tableId: tables.Health.tableId, field: "health" }, op: "!=", right: 0n }],
    });

    const latest$ = combineLatest({
      subjects: subjects$,
      subjectsObserved: subjects$.pipe(scan((count) => count + 1, 0)),
      subjectChanges: subjectChanges$,
      subjectChangesObserved: subjects$.pipe(scan((count) => count + 1, 0)),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
            ],
            "type": "enter",
          },
          {
            "subject": [
              "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            ],
            "type": "enter",
          },
        ],
        "subjectChangesObserved": 1,
        "subjects": [
          [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          ],
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
        ],
        "subjectsObserved": 1,
      }
    `);
  });

  it("can get all players in grassland", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects, subjects$, subjectChanges$ } = await subscribeToQuery(store, {
      from: [{ tableId: tables.Terrain.tableId, subject: ["x", "y"] }],
      where: [{ left: { tableId: tables.Terrain.tableId, field: "terrainType" }, op: "=", right: 2 }],
    });

    const latest$ = combineLatest({
      subjects: subjects$,
      subjectsObserved: subjects$.pipe(scan((count) => count + 1, 0)),
      subjectChanges: subjectChanges$,
      subjectChangesObserved: subjects$.pipe(scan((count) => count + 1, 0)),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              3,
              5,
            ],
            "type": "enter",
          },
        ],
        "subjectChangesObserved": 1,
        "subjects": [
          [
            3,
            5,
          ],
        ],
        "subjectsObserved": 1,
      }
    `);
  });

  it("can get all players without health (e.g. spectator)", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects, subjects$, subjectChanges$ } = await subscribeToQuery(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
      except: [{ tableId: tables.Health.tableId, subject: ["player"] }],
    });

    const latest$ = combineLatest({
      subjects: subjects$,
      subjectsObserved: subjects$.pipe(scan((count) => count + 1, 0)),
      subjectChanges: subjectChanges$,
      subjectChangesObserved: subjects$.pipe(scan((count) => count + 1, 0)),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0xdBa86119a787422C593ceF119E40887f396024E2",
            ],
            "type": "enter",
          },
        ],
        "subjectChangesObserved": 1,
        "subjects": [
          [
            "0xdBa86119a787422C593ceF119E40887f396024E2",
          ],
        ],
        "subjectsObserved": 1,
      }
    `);
  });

  it("emits new subjects when initial matching set is empty", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects, subjects$, subjectChanges$ } = await subscribeToQuery(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
      where: [
        { left: { tableId: tables.Position.tableId, field: "x" }, op: "=", right: 999 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: "=", right: 999 },
      ],
    });

    const latest$ = combineLatest({
      subjects: subjects$,
      subjectsObserved: subjects$.pipe(scan((count) => count + 1, 0)),
      subjectChanges: subjectChanges$,
      subjectChangesObserved: subjects$.pipe(scan((count) => count + 1, 0)),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [],
        "subjectChangesObserved": 1,
        "subjects": [],
        "subjectsObserved": 1,
      }
    `);

    await waitForTransactionReceipt(testClient, {
      hash: await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [999, 999],
      }),
    });
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
            ],
            "type": "enter",
          },
        ],
        "subjectChangesObserved": 2,
        "subjects": [
          [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
        ],
        "subjectsObserved": 2,
      }
    `);
  });

  it("emits changed subjects when subscribing some time after initial query", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects, subjects$, subjectChanges$ } = await subscribeToQuery(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
      where: [
        { left: { tableId: tables.Position.tableId, field: "x" }, op: "=", right: 3 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: "=", right: 5 },
      ],
    });

    const latest$ = combineLatest({
      subjects: subjects$,
      subjectsObserved: subjects$.pipe(scan((count) => count + 1, 0)),
      subjectChanges: subjectChanges$,
      subjectChangesObserved: subjects$.pipe(scan((count) => count + 1, 0)),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            ],
            "type": "enter",
          },
          {
            "subject": [
              "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
            ],
            "type": "enter",
          },
        ],
        "subjectChangesObserved": 1,
        "subjects": [
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        ],
        "subjectsObserved": 1,
      }
    `);

    await waitForTransactionReceipt(testClient, {
      hash: await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [3, 5],
      }),
    });
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
            ],
            "type": "enter",
          },
        ],
        "subjectChangesObserved": 2,
        "subjects": [
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
          [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
        ],
        "subjectsObserved": 2,
      }
    `);

    await waitForTransactionReceipt(testClient, {
      hash: await writeContract(testClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [2, 4],
      }),
    });
    await fetchLatestLogs();

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "subjectChanges": [
          {
            "subject": [
              "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
            ],
            "type": "exit",
          },
        ],
        "subjectChangesObserved": 3,
        "subjects": [
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        ],
        "subjectsObserved": 3,
      }
    `);
  });
});
