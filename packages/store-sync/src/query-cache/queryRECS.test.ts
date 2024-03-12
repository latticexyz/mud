import { beforeAll, describe, expect, it } from "vitest";
import { createHydratedStore, tables } from "./test/createHydratedStore";
import { Has, HasValue, query } from "./queryRECS";
import { deployMockGame } from "../../test/mockGame";
import { Address } from "viem";

describe("query", async () => {
  let worldAddress: Address;
  beforeAll(async () => {
    worldAddress = await deployMockGame();
  });

  it("can get players with a position", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await query(store, [Has(tables.Position)]);

    expect(result).toMatchInlineSnapshot(`
      [
        "0x0000000000000000000000001d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e",
        "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
        "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
        "0x000000000000000000000000dba86119a787422c593cef119e40887f396024e2",
      ]
    `);
  });

  it("can get players at position (3, 5)", async () => {
    const { store } = await createHydratedStore(worldAddress);
    const result = await query(store, [HasValue(tables.Position, { x: 3, y: 5 })]);

    expect(result).toMatchInlineSnapshot(`
      [
        "0x000000000000000000000000328809bc894f92807417d2dad6b7c998c1afdac6",
        "0x000000000000000000000000078cf0753dd50f7c56f20b3ae02719ea199be2eb",
      ]
    `);
  });
});
