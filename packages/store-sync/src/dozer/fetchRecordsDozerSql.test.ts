import { describe, expect, it } from "vitest";
import { fetchRecordsDozerSql } from "./fetchRecordsDozerSql";
import mudConfig from "@latticexyz/world/mud.config";
import { selectFrom } from "./selectFrom";

describe("fetch dozer sql", () => {
  // TODO: set up CI test case for this (requires setting up dozer in CI)
  it.skip("should fetch dozer sql", async () => {
    const result = await fetchRecordsDozerSql({
      url: "https://redstone2.dozer.skystrife.xyz/q",
      address: "0x9d05cc196c87104a7196fcca41280729b505dbbf",
      queries: [selectFrom({ table: mudConfig.tables.world__Balances, where: '"balance" > 0', limit: 2 })],
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "blockHeight": 4839367n,
        "result": [
          [
            {
              "balance": 308500000000000000n,
              "namespaceId": "0x6e73000000000000000000000000000000000000000000000000000000000000",
            },
          ],
        ],
      }
    `);
  });
});
