import { describe, it, expect } from "vitest";
import { createSqliteTable } from "./createSqliteTable";

describe("createSqliteTable", () => {
  it("should return SQL to create table", async () => {
    const { createTableSql } = await createSqliteTable({
      namespace: "test",
      name: "users",
      keySchema: { x: "uint32", y: "uint32" },
      valueSchema: { name: "string", addr: "address" },
    });

    expect(createTableSql).toMatchInlineSnapshot(
      '"create table \\"test:users\\" (\\"x\\" integer default 0 not null, \\"y\\" integer default 0 not null, \\"name\\" text default \'\' not null, \\"addr\\" blob default \'0x0000000000000000000000000000000000000000\' not null, constraint \\"test:users__primary_key\\" primary key (\\"x\\", \\"y\\"))"'
    );
  });
});
