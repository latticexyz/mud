import { describe, it, expect } from "vitest";
import { createSqliteTable } from "./createSqliteTable";

describe("createSqliteTable", () => {
  it("should return SQL to create table", async () => {
    const { createTableSql } = await createSqliteTable({
      namespace: "test",
      name: "users",
      keySchema: { id: "uint256" },
      valueSchema: { name: "string" },
    });

    expect(createTableSql).toMatchInlineSnapshot(
      '"create table \\"test:users\\" (\\"id\\" blob default \'0\' not null, \\"name\\" text default \'\' not null, constraint \\"test:users__primary_key\\" primary key (\\"id\\"))"'
    );
  });
});
