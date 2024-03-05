import { beforeEach, describe, expect, it } from "vitest";
import { createHydratedStore, tables } from "./test/createHydratedStore";
import { subscribeToQuery } from "./subscribeToQuery";
import { filter, firstValueFrom } from "rxjs";
import { config, deployMockGame, deprecatedConfig, worldAbi } from "../../test/mockGame";
import { writeContract } from "viem/actions";
import { keccak256, parseEther, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { publicClient, testClient, walletClient } from "../../test/common";
import { syncToZustand } from "../zustand";

const henryAccount = privateKeyToAccount(keccak256(stringToHex("henry")));

describe("subscribeToQuery", async () => {
  await testClient.setBalance({ address: henryAccount.address, value: parseEther("1") });
  const worldAddress = await deployMockGame();

  beforeEach(async () => {
    const id = await testClient.snapshot();
    return async (): Promise<void> => await testClient.revert({ id });
  });

  it("can get players with a position", async () => {
    const {
      useStore: store,
      storedBlockLogs$,
      waitForTransaction,
    } = await syncToZustand({
      publicClient,
      address: worldAddress,
      config: deprecatedConfig,
    });
    const currentBlockNumber = await publicClient.getBlockNumber();
    await firstValueFrom(storedBlockLogs$.pipe(filter((block) => block.blockNumber >= currentBlockNumber)));

    const result$ = subscribeToQuery(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
    });

    expect(await firstValueFrom(result$)).toMatchInlineSnapshot(`
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

    await waitForTransaction(
      await writeContract(walletClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [1, 2],
      }),
    );
    await testClient.mine({ blocks: 1 });

    expect(await firstValueFrom(result$)).toMatchInlineSnapshot(`
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
          [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
        ],
      }
    `);
  });

  it("can get players at position (3, 5)", async () => {
    const {
      useStore: store,
      storedBlockLogs$,
      waitForTransaction,
    } = await syncToZustand({
      publicClient,
      address: worldAddress,
      config: deprecatedConfig,
    });
    const currentBlockNumber = await publicClient.getBlockNumber();
    await firstValueFrom(storedBlockLogs$.pipe(filter((block) => block.blockNumber >= currentBlockNumber)));

    const result$ = await subscribeToQuery(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
      where: [
        { left: { tableId: tables.Position.tableId, field: "x" }, op: "=", right: 3 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: "=", right: 5 },
      ],
    });

    expect(await firstValueFrom(result$)).toMatchInlineSnapshot(`
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

    console.log("moving in");
    await waitForTransaction(
      await writeContract(walletClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [3, 5],
      }),
    );

    expect(await firstValueFrom(result$)).toMatchInlineSnapshot(`
      {
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
      }
    `);

    console.log("moving out");
    await waitForTransaction(
      await writeContract(walletClient, {
        account: henryAccount,
        chain: null,
        address: worldAddress,
        abi: worldAbi,
        functionName: "move",
        args: [2, 4],
      }),
    );

    expect(await firstValueFrom(result$)).toMatchInlineSnapshot(`
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
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);
    const result$ = await subscribeToQuery(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
      where: [
        { left: { tableId: tables.Position.tableId, field: "x" }, op: ">=", right: -5 },
        { left: { tableId: tables.Position.tableId, field: "x" }, op: "<=", right: 5 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: ">=", right: -5 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: "<=", right: 5 },
      ],
    });

    expect(await firstValueFrom(result$)).toMatchInlineSnapshot(`
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
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);
    const result$ = await subscribeToQuery(store, {
      from: [
        { tableId: tables.Position.tableId, subject: ["player"] },
        { tableId: tables.Health.tableId, subject: ["player"] },
      ],
      where: [{ left: { tableId: tables.Health.tableId, field: "health" }, op: "!=", right: 0n }],
    });

    expect(await firstValueFrom(result$)).toMatchInlineSnapshot(`
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
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);
    const result$ = await subscribeToQuery(store, {
      from: [{ tableId: tables.Terrain.tableId, subject: ["x", "y"] }],
      where: [{ left: { tableId: tables.Terrain.tableId, field: "terrainType" }, op: "=", right: 2 }],
    });

    expect(await firstValueFrom(result$)).toMatchInlineSnapshot(`
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
});
