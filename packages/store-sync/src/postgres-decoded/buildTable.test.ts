import { describe, it, expect } from "vitest";
import { buildTable } from "./buildTable";
import { getTableColumns } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { mapObject } from "@latticexyz/common/utils";

describe("buildTable", () => {
  it("should create table from schema", async () => {
    const table = buildTable({
      address: "0xffffffffffffffffffffffffffffffffffffffff",
      namespace: "testNS",
      name: "UsersTable",
      keySchema: { x: "uint32", y: "uint32" },
      valueSchema: { name: "string", walletAddress: "address" },
    });

    expect(getTableConfig(table).schema).toMatch(/0xffffffffffffffffffffffffffffffffffffffff__testNS$/);
    expect(getTableConfig(table).name).toMatchInlineSnapshot('"users_table"');
    expect(
      mapObject(getTableColumns(table), (column) => ({
        name: column.name,
        dataType: column.dataType,
        sqlName: column.sqlName,
        notNull: column.notNull,
      }))
    ).toMatchInlineSnapshot(`
      {
        "__keyBytes": {
          "dataType": "custom",
          "name": "__key_bytes",
          "notNull": true,
          "sqlName": "bytea",
        },
        "__lastUpdatedBlockNumber": {
          "dataType": "custom",
          "name": "__last_updated_block_number",
          "notNull": false,
          "sqlName": "numeric",
        },
        "name": {
          "dataType": "string",
          "name": "name",
          "notNull": true,
          "sqlName": undefined,
        },
        "walletAddress": {
          "dataType": "custom",
          "name": "wallet_address",
          "notNull": true,
          "sqlName": "bytea",
        },
        "x": {
          "dataType": "custom",
          "name": "x",
          "notNull": true,
          "sqlName": "integer",
        },
        "y": {
          "dataType": "custom",
          "name": "y",
          "notNull": true,
          "sqlName": "integer",
        },
      }
    `);
  });

  it("can create a singleton table", async () => {
    const table = buildTable({
      address: "0xffffffffffffffffffffffffffffffffffffffff",
      namespace: "testNS",
      name: "UsersTable",
      keySchema: {},
      valueSchema: { addrs: "address[]" },
    });

    expect(getTableConfig(table).schema).toMatch(/0xffffffffffffffffffffffffffffffffffffffff__testNS$/);
    expect(getTableConfig(table).name).toMatchInlineSnapshot('"users_table"');
    expect(
      mapObject(getTableColumns(table), (column) => ({
        name: column.name,
        dataType: column.dataType,
        sqlName: column.sqlName,
      }))
    ).toMatchInlineSnapshot(`
      {
        "__keyBytes": {
          "dataType": "custom",
          "name": "__key_bytes",
          "sqlName": "bytea",
        },
        "__lastUpdatedBlockNumber": {
          "dataType": "custom",
          "name": "__last_updated_block_number",
          "sqlName": "numeric",
        },
        "addrs": {
          "dataType": "custom",
          "name": "addrs",
          "sqlName": "text",
        },
      }
    `);
  });
});
