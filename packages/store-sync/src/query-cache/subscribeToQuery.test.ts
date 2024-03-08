import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createHydratedStore, tables } from "./test/createHydratedStore";
import { subscribeToQuery } from "./subscribeToQuery";
import { deployMockGame, worldAbi } from "../../test/mockGame";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { Address, keccak256, parseEther, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { testClient } from "../../test/common";
import { observe } from "../../test/observe";

const henryAccount = privateKeyToAccount(keccak256(stringToHex("henry")));

describe("subscribeToQuery", async () => {
  let worldAddress: Address;

  beforeAll(async () => {
    await testClient.setIntervalMining({ interval: 0 });
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

    const observedSubjects = observe(subjects$);
    const observedSubjectChanges = observe(subjectChanges$);

    expect(subjects).toMatchInlineSnapshot(`
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

    expect(observedSubjects.length).toBe(1);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot(`
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

    expect(observedSubjects.lastValue).toBe(subjects);

    expect(observedSubjectChanges.length).toBe(1);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot(`
      [
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
      ]
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

    expect(observedSubjects.length).toBe(2);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot(`
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
        [
          "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
        ],
      ]
    `);

    expect(observedSubjectChanges.length).toBe(2);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot(`
      [
        {
          "subject": [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
          "type": "enter",
        },
      ]
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

    const observedSubjects = observe(subjects$);
    const observedSubjectChanges = observe(subjectChanges$);

    expect(subjects).toMatchInlineSnapshot(`
      [
        [
          "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
        ],
        [
          "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
        ],
      ]
    `);

    expect(observedSubjects.length).toBe(1);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot(`
      [
        [
          "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
        ],
        [
          "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
        ],
      ]
    `);

    expect(observedSubjects.lastValue).toBe(subjects);

    expect(observedSubjectChanges.length).toBe(1);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot(`
      [
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
      ]
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

    expect(observedSubjects.length).toBe(2);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot(`
      [
        [
          "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
        ],
        [
          "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
        ],
        [
          "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
        ],
      ]
    `);

    expect(observedSubjectChanges.length).toBe(2);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot(`
      [
        {
          "subject": [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
          "type": "enter",
        },
      ]
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

    expect(observedSubjects.length).toBe(3);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot(`
      [
        [
          "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
        ],
        [
          "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
        ],
      ]
    `);

    expect(observedSubjectChanges.length).toBe(3);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot(`
      [
        {
          "subject": [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
          "type": "exit",
        },
      ]
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
    const observedSubjects = observe(subjects$);
    const observedSubjectChanges = observe(subjectChanges$);

    expect(subjects).toMatchInlineSnapshot(`
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

    expect(observedSubjects.length).toBe(1);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot(`
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

    expect(observedSubjects.lastValue).toBe(subjects);

    expect(observedSubjectChanges.length).toBe(1);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot(`
      [
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
      ]
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

    expect(observedSubjects.length).toBe(2);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot(`
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
          "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
        ],
      ]
    `);

    expect(observedSubjectChanges.length).toBe(2);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot(`
      [
        {
          "subject": [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
          "type": "enter",
        },
      ]
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

    expect(observedSubjects.length).toBe(3);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot(`
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

    expect(observedSubjectChanges.length).toBe(3);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot(`
      [
        {
          "subject": [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
          "type": "exit",
        },
      ]
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
    const observedSubjects = observe(subjects$);
    const observedSubjectChanges = observe(subjectChanges$);

    expect(subjects).toMatchInlineSnapshot(`
      [
        [
          "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
        ],
        [
          "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
        ],
      ]
    `);

    expect(observedSubjects.length).toBe(1);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot(`
      [
        [
          "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
        ],
        [
          "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
        ],
      ]
    `);

    expect(observedSubjects.lastValue).toBe(subjects);

    expect(observedSubjectChanges.length).toBe(1);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot(`
      [
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
      ]
    `);
  });

  it("can get all players in grassland", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects, subjects$, subjectChanges$ } = await subscribeToQuery(store, {
      from: [{ tableId: tables.Terrain.tableId, subject: ["x", "y"] }],
      where: [{ left: { tableId: tables.Terrain.tableId, field: "terrainType" }, op: "=", right: 2 }],
    });
    const observedSubjects = observe(subjects$);
    const observedSubjectChanges = observe(subjectChanges$);

    expect(subjects).toMatchInlineSnapshot(`
      [
        [
          3,
          5,
        ],
      ]
    `);

    expect(observedSubjects.length).toBe(1);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot(`
      [
        [
          3,
          5,
        ],
      ]
    `);

    expect(observedSubjects.lastValue).toBe(subjects);

    expect(observedSubjectChanges.length).toBe(1);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot(`
      [
        {
          "subject": [
            3,
            5,
          ],
          "type": "enter",
        },
      ]
    `);
  });

  it("can get all players without health (e.g. spectator)", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { subjects, subjects$, subjectChanges$ } = await subscribeToQuery(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
      except: [{ tableId: tables.Health.tableId, subject: ["player"] }],
    });
    const observedSubjects = observe(subjects$);
    const observedSubjectChanges = observe(subjectChanges$);

    expect(subjects).toMatchInlineSnapshot(`
      [
        [
          "0xdBa86119a787422C593ceF119E40887f396024E2",
        ],
      ]
    `);

    expect(observedSubjects.length).toBe(1);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot(`
      [
        [
          "0xdBa86119a787422C593ceF119E40887f396024E2",
        ],
      ]
    `);

    expect(observedSubjects.lastValue).toBe(subjects);

    expect(observedSubjectChanges.length).toBe(1);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot(`
      [
        {
          "subject": [
            "0xdBa86119a787422C593ceF119E40887f396024E2",
          ],
          "type": "enter",
        },
      ]
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

    const observedSubjects = observe(subjects$);
    const observedSubjectChanges = observe(subjectChanges$);

    expect(subjects).toMatchInlineSnapshot("[]");

    expect(observedSubjects.length).toBe(1);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot("[]");

    expect(observedSubjects.lastValue).toBe(subjects);

    expect(observedSubjectChanges.length).toBe(1);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot("[]");

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

    expect(observedSubjects.length).toBe(2);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot(`
      [
        [
          "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
        ],
      ]
    `);

    expect(observedSubjectChanges.length).toBe(2);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot(`
      [
        {
          "subject": [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
          "type": "enter",
        },
      ]
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

    expect(subjects).toMatchInlineSnapshot(`
      [
        [
          "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
        ],
        [
          "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
        ],
      ]
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

    const observedSubjects = observe(subjects$);
    const observedSubjectChanges = observe(subjectChanges$);

    expect(observedSubjects.length).toBe(2);
    expect(observedSubjects.values).toMatchInlineSnapshot(`
      [
        [
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        ],
        [
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
      ]
    `);

    expect(observedSubjectChanges.length).toBe(2);
    expect(observedSubjectChanges.values).toMatchInlineSnapshot(`
      [
        [
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
        [
          {
            "subject": [
              "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
            ],
            "type": "enter",
          },
        ],
      ]
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

    expect(observedSubjects.length).toBe(3);
    expect(observedSubjects.lastValue).toMatchInlineSnapshot(`
      [
        [
          "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
        ],
        [
          "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
        ],
      ]
    `);

    expect(observedSubjectChanges.length).toBe(3);
    expect(observedSubjectChanges.lastValue).toMatchInlineSnapshot(`
      [
        {
          "subject": [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
          "type": "exit",
        },
      ]
    `);
  });
});
