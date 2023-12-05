import { Sql } from "postgres";
import { Middleware } from "koa";
import Router from "@koa/router";
import compose from "koa-compose";
import { input } from "@latticexyz/store-sync/trpc-indexer";
import { storeTables } from "@latticexyz/store-sync";
import { queryLogs } from "./queryLogs";
import { recordToLog } from "./recordToLog";
import { debug } from "../debug";
import { createBenchmark } from "@latticexyz/common";
import superjson from "superjson";

export function getLogs(database: Sql): Middleware {
  const router = new Router();

  router.get("/get/logs", async (ctx) => {
    const benchmark = createBenchmark("getLogs");

    try {
      const opts = input.parse(typeof ctx.query.input === "string" ? JSON.parse(ctx.query.input) : {});
      opts.filters = opts.filters.length > 0 ? [...opts.filters, { tableId: storeTables.Tables.tableId }] : [];
      benchmark("parse config");

      const records = await queryLogs(database, opts ?? {}).execute();
      benchmark("query records");

      const logs = records.map(recordToLog);
      benchmark("map records to logs");

      const blockNumber = BigInt(records[0].chainBlockNumber);

      ctx.status = 200;

      // TODO: replace superjson with more efficient encoding
      ctx.body = superjson.stringify({ blockNumber, logs });
    } catch (error) {
      ctx.status = 500;
      ctx.body = error;
      debug(error);
    }

    // .cursor(100, async (rows) => {
    //   if (!hasEmittedConfig && rows.length) {
    //     ctx.send("config", {
    //       indexerVersion: rows[0].indexerVersion,
    //       chainId: rows[0].chainId,
    //       lastUpdatedBlockNumber: rows[0].chainBlockNumber,
    //       totalRows: rows[0].totalRows,
    //     });
    //     hasEmittedConfig = true;
    //   }

    //   rows.forEach((row) => {
    //     ctx.send("log", {
    //       // TODO: either properly encode bigints in a JSON-safe way or fix these types
    //       blockNumber: row.chainBlockNumber as unknown as bigint,
    //       address: row.address,
    //       eventName: "Store_SetRecord",
    //       args: {
    //         tableId: row.tableId,
    //         keyTuple: decodeDynamicField("bytes32[]", row.keyBytes),
    //         staticData: row.staticData ?? "0x",
    //         encodedLengths: row.encodedLengths ?? "0x",
    //         dynamicData: row.dynamicData ?? "0x",
    //       },
    //     });
    //   });
    // });

    // TODO: subscribe + continue writing
  });

  return compose([router.routes(), router.allowedMethods()]) as Middleware;
}
