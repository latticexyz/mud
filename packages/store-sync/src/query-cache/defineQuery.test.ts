import { beforeAll, describe, expect, it } from "vitest";
import { createHydratedStore, tables } from "./test/createHydratedStore";
import { deployMockGame, worldAbi } from "../../test/mockGame";
import { writeContract } from "viem/actions";
import { Address, keccak256, parseEther, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { testClient } from "../../test/common";
import { combineLatest, filter, firstValueFrom, map, scan, shareReplay } from "rxjs";
import { waitForTransaction } from "./test/waitForTransaction";
import { EntityChange, Has, HasValue, Not, NotValue, defineQuery } from "./recs/queryRECS";
import { Entity } from "@latticexyz/recs";

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
            "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
            "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
            "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
            "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
          ],
        },
        "update$": {
          "count": 1,
          "value": [
            {
              "entity": "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
              "type": 0,
            },
            {
              "entity": "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
              "type": 0,
            },
            {
              "entity": "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
              "type": 0,
            },
            {
              "entity": "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
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
            "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
            "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
            "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
            "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
            "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
          ],
        },
        "update$": {
          "count": 2,
          "value": [
            {
              "entity": "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
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
            "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
            "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
          ],
        },
        "update$": {
          "count": 1,
          "value": [
            {
              "entity": "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
              "type": 0,
            },
            {
              "entity": "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
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
            "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
            "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
            "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
          ],
        },
        "update$": {
          "count": 2,
          "value": [
            {
              "entity": "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
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
            "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
            "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
          ],
        },
        "update$": {
          "count": 3,
          "value": [
            {
              "entity": "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
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
            "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
            "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
          ],
        },
        "update$": {
          "count": 1,
          "value": [
            {
              "entity": "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
              "type": 0,
            },
            {
              "entity": "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
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
            "0x00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000005",
          ],
        },
        "update$": {
          "count": 1,
          "value": [
            {
              "entity": "0x00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000005",
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
            "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
          ],
        },
        "update$": {
          "count": 1,
          "value": [
            {
              "entity": "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
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
            "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
          ],
        },
        "update$": {
          "count": 2,
          "value": [
            {
              "entity": "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
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
            "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
            "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
            "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
          ],
        },
        "update$": {
          "count": 2,
          "value": [
            {
              "entity": "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
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
            "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
            "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
          ],
        },
        "update$": {
          "count": 3,
          "value": [
            {
              "entity": "0x0000000000000000000000005f2cc8fb10299751348e1b10f5f1ba47820b1cb8",
              "type": 1,
            },
          ],
        },
      }
    `);
  });
});
