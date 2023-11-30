import { beforeEach, describe, expect, it } from "vitest";
import { DefaultLogger, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { Hex, RpcLog, createPublicClient, decodeEventLog, formatLog, http } from "viem";
import { foundry } from "viem/chains";
import { getTables } from "./getTables";
import { PostgresStorageAdapter, createStorageAdapter } from "./createStorageAdapter";
import { buildTable } from "./buildTable";
import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { StoreEventsLog } from "../common";
import worldRpcLogs from "../../../../test-data/world-logs.json";
import { resourceToHex } from "@latticexyz/common";

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

describe("createStorageAdapter", async () => {
  const db = drizzle(postgres(process.env.DATABASE_URL!), {
    logger: new DefaultLogger(),
  });

  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(),
  });

  let storageAdapter: PostgresStorageAdapter;

  beforeEach(async () => {
    storageAdapter = await createStorageAdapter({ database: db, publicClient });
    return storageAdapter.cleanUp;
  });

  it("should create tables and data from block log", async () => {
    for (const block of blocks) {
      await storageAdapter.storageAdapter(block);
    }

    expect(await db.select().from(storageAdapter.tables.chainTable)).toMatchInlineSnapshot(`
      [
        {
          "chainId": 31337,
          "lastUpdatedBlockNumber": 12n,
        },
      ]
    `);

    expect(
      await db
        .select()
        .from(storageAdapter.tables.recordsTable)
        .where(
          eq(
            storageAdapter.tables.recordsTable.tableId,
            resourceToHex({ type: "table", namespace: "", name: "NumberList" })
          )
        )
    ).toMatchInlineSnapshot(`
      [
        {
          "address": "0x6E9474e9c83676B9A71133FF96Db43E7AA0a4342",
          "dynamicData": "0x000001a400000045",
          "encodedLengths": "0x0000000000000000000000000000000000000000000000000800000000000008",
          "isDeleted": false,
          "key0": null,
          "key1": null,
          "keyBytes": "0x",
          "lastUpdatedBlockNumber": 12n,
          "staticData": null,
          "tableId": "0x746200000000000000000000000000004e756d6265724c697374000000000000",
        },
      ]
    `);

    const tables = (await getTables(db)).filter((table) => table.name === "NumberList");
    expect(tables).toMatchInlineSnapshot(`
      [
        {
          "address": "0x6E9474e9c83676B9A71133FF96Db43E7AA0a4342",
          "keySchema": {},
          "name": "NumberList",
          "namespace": "",
          "tableId": "0x746200000000000000000000000000004e756d6265724c697374000000000000",
          "valueSchema": {
            "value": "uint32[]",
          },
        },
      ]
    `);

    const sqlTable = buildTable(tables[0]);
    expect(await db.select().from(sqlTable)).toMatchInlineSnapshot(`
      [
        {
          "__keyBytes": "0x",
          "__lastUpdatedBlockNumber": 12n,
          "value": [
            420,
            69,
          ],
        },
      ]
    `);

    await storageAdapter.cleanUp();
  });
});
