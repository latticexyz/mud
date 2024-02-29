import { describe, expect, it } from "vitest";
import { createHydratedStore, tables } from "./test/createHydratedStore";
import { query } from "./query";

describe("query", async () => {
  const store = await createHydratedStore();

  it("can get players with a position", async () => {
    const result = await query(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
    });

    expect(result).toMatchInlineSnapshot(`
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
  });

  it("can get players at position (3, 5)", async () => {
    const result = await query(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
      where: [
        { left: { tableId: tables.Position.tableId, field: "x" }, op: "=", right: 3 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: "=", right: 5 },
      ],
    });

    expect(result).toMatchInlineSnapshot(`
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
});
