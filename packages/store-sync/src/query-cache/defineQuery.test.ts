import { beforeAll, describe, expect, it } from "vitest";
import { createHydratedStore, tables } from "./test/createHydratedStore";
import { deployMockGame, worldAbi } from "../../test/mockGame";
import { writeContract } from "viem/actions";
import { Address, keccak256, parseEther, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { testClient } from "../../test/common";
import { combineLatest, filter, firstValueFrom, map, scan, shareReplay } from "rxjs";
import { waitForTransaction } from "./test/waitForTransaction";
import { Entity, EntityChange, Has, HasValue, Not, NotValue, defineQuery } from "./queryRECS";

const henryAccount = privateKeyToAccount(keccak256(stringToHex("henry")));

describe("defineQuery", async () => {
  let worldAddress: Address;
  beforeAll(async () => {
    await testClient.setBalance({ address: henryAccount.address, value: parseEther("1") });
    worldAddress = await deployMockGame();
  });

  it("can get players with a position", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { update$, matching } = await defineQuery(store, [Has(tables.Position)]);

    const latest$ = combineLatest({
      update$: update$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly EntityChange[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      matching: matching.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly Entity[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "matching": {
          "count": 1,
          "value": [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
            "0xdBa86119a787422C593ceF119E40887f396024E2",
          ],
        },
        "update$": {
          "count": 1,
          "value": [
            {
              "entity": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              "type": 0,
            },
            {
              "entity": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              "type": 0,
            },
            {
              "entity": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              "type": 0,
            },
            {
              "entity": "0xdBa86119a787422C593ceF119E40887f396024E2",
              "type": 0,
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
        "matching": {
          "count": 2,
          "value": [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
            "0xdBa86119a787422C593ceF119E40887f396024E2",
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
        },
        "update$": {
          "count": 2,
          "value": [
            {
              "entity": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              "type": 0,
            },
          ],
        },
      }
    `);
  });

  it("can get players at position (3, 5)", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { update$, matching } = await defineQuery(store, [HasValue(tables.Position, { x: 3, y: 5 })]);

    const latest$ = combineLatest({
      update$: update$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly EntityChange[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      matching: matching.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly Entity[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "matching": {
          "count": 1,
          "value": [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        },
        "update$": {
          "count": 1,
          "value": [
            {
              "entity": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              "type": 0,
            },
            {
              "entity": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              "type": 0,
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
        "matching": {
          "count": 2,
          "value": [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
        },
        "update$": {
          "count": 2,
          "value": [
            {
              "entity": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              "type": 0,
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
        "matching": {
          "count": 3,
          "value": [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        },
        "update$": {
          "count": 3,
          "value": [
            {
              "entity": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              "type": 1,
            },
          ],
        },
      }
    `);
  });

  it("can get players that are still alive", async () => {
    const { store } = await createHydratedStore(worldAddress);

    const { update$, matching } = await defineQuery(store, [
      Has(tables.Position),
      NotValue(tables.Health, { health: 0n }),
    ]);

    const latest$ = combineLatest({
      update$: update$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly EntityChange[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      matching: matching.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly Entity[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "matching": {
          "count": 1,
          "value": [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
        },
        "update$": {
          "count": 1,
          "value": [
            {
              "entity": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              "type": 0,
            },
            {
              "entity": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              "type": 0,
            },
          ],
        },
      }
    `);
  });

  it("can get all players in grassland", async () => {
    const { store } = await createHydratedStore(worldAddress);

    const { update$, matching } = await defineQuery(store, [HasValue(tables.Terrain, { terrainType: 2 as never })]);

    const latest$ = combineLatest({
      update$: update$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly EntityChange[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      matching: matching.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly Entity[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "matching": {
          "count": 1,
          "value": [
            "3:5",
          ],
        },
        "update$": {
          "count": 1,
          "value": [
            {
              "entity": "3:5",
              "type": 0,
            },
          ],
        },
      }
    `);
  });

  it("can get all players without health (e.g. spectator)", async () => {
    const { store } = await createHydratedStore(worldAddress);

    const { update$, matching } = await defineQuery(store, [Has(tables.Position), Not(tables.Health)]);

    const latest$ = combineLatest({
      update$: update$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly EntityChange[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      matching: matching.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly Entity[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "matching": {
          "count": 1,
          "value": [
            "0xdBa86119a787422C593ceF119E40887f396024E2",
          ],
        },
        "update$": {
          "count": 1,
          "value": [
            {
              "entity": "0xdBa86119a787422C593ceF119E40887f396024E2",
              "type": 0,
            },
          ],
        },
      }
    `);
  });

  it("emits new subjects when initial matching set is empty", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { update$, matching } = await defineQuery(store, [HasValue(tables.Position, { x: 999, y: 999 })]);

    const latest$ = combineLatest({
      update$: update$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly EntityChange[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      matching: matching.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly Entity[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    expect(await firstValueFrom(latest$)).toMatchInlineSnapshot(`
      {
        "matching": {
          "count": 1,
          "value": [],
        },
        "update$": {
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
        "matching": {
          "count": 2,
          "value": [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
        },
        "update$": {
          "count": 2,
          "value": [
            {
              "entity": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              "type": 0,
            },
          ],
        },
      }
    `);
  });

  it("emits changed subjects when subscribing some time after initial query", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);

    const { update$, matching } = await defineQuery(store, [HasValue(tables.Position, { x: 3, y: 5 })]);

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
      update$: update$.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly EntityChange[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
      matching: matching.pipe(
        scan((values, value) => [...values, value], [] as readonly (readonly Entity[])[]),
        map((values) => ({ count: values.length, value: values.at(-1) })),
      ),
    }).pipe(shareReplay(1));

    // we expect two emissions for by this point: initial subjects + subjects changed since starting the subscriptions
    expect(
      await firstValueFrom(latest$.pipe(filter((latest) => latest.matching.count === 2 && latest.update$.count === 2))),
    ).toMatchInlineSnapshot(`
      {
        "matching": {
          "count": 2,
          "value": [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
        },
        "update$": {
          "count": 2,
          "value": [
            {
              "entity": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              "type": 0,
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
      await firstValueFrom(latest$.pipe(filter((latest) => latest.matching.count === 3 && latest.update$.count === 3))),
    ).toMatchInlineSnapshot(`
      {
        "matching": {
          "count": 3,
          "value": [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        },
        "update$": {
          "count": 3,
          "value": [
            {
              "entity": "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
              "type": 1,
            },
          ],
        },
      }
    `);
  });
});
