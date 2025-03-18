import { Middleware } from "koa";
import Router from "@koa/router";
import compose from "koa-compose";
import { input } from "@latticexyz/store-sync/indexer-client";
import { tablesWithRecordsToLogs } from "@latticexyz/store-sync";
import { debug } from "../../debug";
import { createBenchmark } from "@latticexyz/common";
import { compress } from "../../koa-middleware/compress";
import { getTablesWithRecords } from "../getTablesWithRecords";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function apiRoutesV2(database: BaseSQLiteDatabase<"sync", any>): Middleware {
  const router = new Router();

  router.get("/api/2/logs", compress(), async (ctx) => {
    const benchmark = createBenchmark("sqlite:logs:v2");

    let options: ReturnType<typeof input.parse>;

    try {
      options = input.parse(typeof ctx.query.input === "string" ? JSON.parse(ctx.query.input) : {});
    } catch (error) {
      ctx.status = 400;
      ctx.body = JSON.stringify(error);
      debug(error);
      return;
    }

    try {
      benchmark("parse config");
      const { blockNumber, tables } = getTablesWithRecords(database, options);
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
