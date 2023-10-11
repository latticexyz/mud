import { beforeEach, describe, expect, it } from "vitest";
import { sqliteStorage } from "./sqliteStorage";
import { getTables } from "./getTables";
import { chainState, mudStoreTables } from "./internalTables";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { buildTable } from "./buildTable";
import initSqlJs from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import { Hex, RpcLog, createPublicClient, decodeEventLog, formatLog, http } from "viem";
import { foundry } from "viem/chains";
import worldRpcLogs from "../../../../test-data/world-logs.json";
import { storeEventsAbi } from "@latticexyz/store";
import { StoreEventsLog } from "../common";
import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { eq } from "drizzle-orm";

// TODO: make test-data a proper package and export this
const blocks = groupLogsByBlockNumber(
  worldRpcLogs.map((log) => {
    const { eventName, args } = decodeEventLog({
      abi: storeEventsAbi,
      data: log.data as Hex,
      topics: log.topics as [Hex, ...Hex[]],
      strict: true,
    });
    return formatLog(log as any as RpcLog, { args, eventName: eventName as string }) as StoreEventsLog;
  })
);

describe("sqliteStorage", async () => {
  const SqlJs = await initSqlJs();
  let db: BaseSQLiteDatabase<"sync", void>;

  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(),
  });

  beforeEach(async () => {
    db = drizzle(new SqlJs.Database(), {
      // logger: new DefaultLogger(),
    });
  });

  it("should create tables and data from block log", async () => {
    expect(() => db.select().from(chainState).all()).toThrowErrorMatchingInlineSnapshot(
      '"no such table: __chainState"'
    );
    expect(() => db.select().from(mudStoreTables).all()).toThrowErrorMatchingInlineSnapshot(
      '"no such table: __mudStoreTables"'
    );

    const storageAdapter = await sqliteStorage({ database: db, publicClient });

    expect(db.select().from(chainState).all()).toMatchInlineSnapshot("[]");
    expect(db.select().from(mudStoreTables).all()).toMatchInlineSnapshot("[]");

    for (const block of blocks) {
      await storageAdapter(block);
    }

    expect(db.select().from(chainState).all()).toMatchInlineSnapshot(`
      [
        {
          "chainId": 31337,
          "lastError": null,
          "lastUpdatedBlockNumber": 12n,
          "schemaVersion": 1,
        },
      ]
    `);

    expect(db.select().from(mudStoreTables).where(eq(mudStoreTables.name, "NumberList")).all()).toMatchInlineSnapshot(`
      [
        {
          "address": "0x6E9474e9c83676B9A71133FF96Db43E7AA0a4342",
          "id": "0x6E9474e9c83676B9A71133FF96Db43E7AA0a4342____NumberList",
          "keySchema": {},
          "lastError": null,
          "lastUpdatedBlockNumber": 12n,
          "name": "NumberList",
          "namespace": "",
          "schemaVersion": 1,
          "tableId": "0x746200000000000000000000000000004e756d6265724c697374000000000000",
          "valueSchema": {
            "value": "uint32[]",
          },
        },
      ]
    `);

    const tables = getTables(db).filter((table) => table.name === "NumberList");
    expect(tables).toMatchInlineSnapshot(`
      [
        {
          "address": "0x6E9474e9c83676B9A71133FF96Db43E7AA0a4342",
          "id": "0x6E9474e9c83676B9A71133FF96Db43E7AA0a4342____NumberList",
          "keySchema": {},
          "lastError": null,
          "lastUpdatedBlockNumber": 12n,
          "name": "NumberList",
          "namespace": "",
          "schemaVersion": 1,
          "tableId": "0x746200000000000000000000000000004e756d6265724c697374000000000000",
          "valueSchema": {
            "value": "uint32[]",
          },
        },
      ]
    `);

    const sqlTable = buildTable(tables[0]);
    expect(db.select().from(sqlTable).all()).toMatchInlineSnapshot(`
      [
        {
          "__dynamicData": "0x000001a400000045",
          "__encodedLengths": "0x0000000000000000000000000000000000000000000000000800000000000008",
          "__isDeleted": false,
          "__key": "0x",
          "__lastUpdatedBlockNumber": 12n,
          "__staticData": null,
          "value": [
            420,
            69,
          ],
        },
      ]
    `);
  });
});
