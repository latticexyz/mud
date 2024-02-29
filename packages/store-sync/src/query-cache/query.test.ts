import { describe, expect, it } from "vitest";
import { createHydratedStore, tables } from "./test/createHydratedStore";
import { query } from "./query";

describe("query", async () => {
  const store = await createHydratedStore();

  it("sets component values from logs", async () => {
    const result = await query(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["zone", "x", "y"] }],
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "subjects": [],
      }
    `);
  });
});
