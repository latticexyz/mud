import { beforeAll, describe, expect, it } from "vitest";
import { createHydratedStore, tables } from "../test/createHydratedStore";
import { Has, HasValue, Not, NotValue, runQuery } from "./queryRECS";
import { deployMockGame } from "../../../test/mockGame";
import { Address } from "viem";

describe("runQuery", async () => {
  let worldAddress: Address;
  beforeAll(async () => {
    worldAddress = await deployMockGame();
  });

  it("can get players with a position", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await runQuery(store, [Has(tables.Position)]);

    expect(result).toMatchInlineSnapshot(`
      Set {
        "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
        "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
        "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
        "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
      }
    `);
  });

  it("can get players at position (3, 5)", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await runQuery(store, [HasValue(tables.Position, { x: 3, y: 5 })]);

    expect(result).toMatchInlineSnapshot(`
      Set {
        "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
        "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
      }
    `);
  });

  it("can get players that are still alive", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await runQuery(store, [Has(tables.Position), NotValue(tables.Health, { health: 0n })]);

    expect(result).toMatchInlineSnapshot(`
      Set {
        "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
        "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
      }
    `);
  });

  it("can get all players in grassland", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await runQuery(store, [HasValue(tables.Terrain, { terrainType: 2 as never })]);

    expect(result).toMatchInlineSnapshot(`
      Set {
        "0x00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000005",
      }
    `);
  });

  it("can get all players without health (e.g. spectator)", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await runQuery(store, [Has(tables.Position), Not(tables.Health)]);

    expect(result).toMatchInlineSnapshot(`
      Set {
        "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
      }
    `);
  });
});
