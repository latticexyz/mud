import { FastifyReply, FastifyRequest } from "fastify";
import { parseEnv } from "./parseEnv";
import { z } from "zod";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { buildTable, getTables } from "@latticexyz/store-sync/sqlite";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { hexToString, padHex } from "viem";
import { decodeDynamicField, encodeValue } from "@latticexyz/protocol-parser";
import { eq } from "drizzle-orm";

const env = parseEnv(
  z.object({
    SQLITE_FILENAME: z.string().default("indexer.db"),
  })
);

const database = drizzle(new Database(env.SQLITE_FILENAME)) as BaseSQLiteDatabase<"sync", any>;

// \n and \r are event-terminating characters in SSE spec, so we need to escape them, along with the escape character itself.
const charsToEscape = ["\x27", "\n", "\r"];
function escapeForSSE(value: string): string {
  return value.replaceAll(/[\x27\n\r]/g, (char) => `\0${charsToEscape.indexOf(char)}`);
}
// TODO: unescape

export async function streamHandler(req: FastifyRequest, res: FastifyReply): Promise<void> {
  try {
    res.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });

    const tables = getTables(database);
    for (const table of tables) {
      const sqlTable = buildTable(table);
      const records = database
        .select({
          blockNumber: sqlTable.__lastUpdatedBlockNumber,
          encodedKey: sqlTable.__key,
          staticData: sqlTable.__staticData,
          encodedLengths: sqlTable.__encodedLengths,
          dynamicData: sqlTable.__dynamicData,
        })
        .from(sqlTable)
        .where(eq(sqlTable.__isDeleted, false))
        .all();

      for (const record of records) {
        const encodedEvent = encodeValue(
          {
            blockNumber: "uint256",
            address: "address",
            event: "string",
            tableId: "bytes32",
            keyTuple: "bytes32[]",
            staticData: "bytes",
            encodedLengths: "bytes32",
            dynamicData: "bytes",
          },
          {
            blockNumber: record.blockNumber,
            address: table.address,
            event: "Store_SetRecord",
            tableId: table.tableId,
            keyTuple: decodeDynamicField("bytes32[]", record.encodedKey),
            staticData: record.staticData ?? "0x",
            encodedLengths: record.encodedLengths ?? padHex("0x", { size: 32 }),
            dynamicData: record.dynamicData ?? "0x",
          }
        );

        res.raw.write(`data: ${escapeForSSE(hexToString(encodedEvent))}\n`);
        res.raw.write(`\n`);
      }
    }

    res.raw.write(":end\n\n");
    console.log("end");

    res.raw.end();
  } catch (error) {
    console.error(error);
    throw error;
  }
}
