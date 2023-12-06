import { Middleware } from "koa";
import Router from "@koa/router";
import compose from "koa-compose";
import { input } from "@latticexyz/store-sync/indexer-client";
import { storeTables, tablesWithRecordsToLogs } from "@latticexyz/store-sync";
import { debug } from "../debug";
import { createBenchmark } from "@latticexyz/common";
import { compress } from "../compress";
import { getTablesWithRecords } from "./getTablesWithRecords";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

export function getLogs(database: BaseSQLiteDatabase<"sync", any>): Middleware {
  const router = new Router();

  router.get("/get/logs", compress(), async (ctx) => {
    const benchmark = createBenchmark("sqliteGetLogs");

    try {
      const opts = input.parse(typeof ctx.query.input === "string" ? JSON.parse(ctx.query.input) : {});
      opts.filters = opts.filters.length > 0 ? [...opts.filters, { tableId: storeTables.Tables.tableId }] : [];
      benchmark("parse config");

      const { blockNumber, tables } = getTablesWithRecords(database, opts);
      benchmark("query tables with records");

      const logs = tablesWithRecordsToLogs(tables);
      benchmark("convert records to logs");

      ctx.body = JSON.stringify({ blockNumber: blockNumber?.toString() ?? "-1", logs });
      ctx.status = 200;
    } catch (error) {
      ctx.status = 500;
      ctx.body = JSON.stringify(error);
      debug(error);
    }
  });

  return compose([router.routes(), router.allowedMethods()]) as Middleware;
}
