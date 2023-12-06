import { Sql } from "postgres";
import { Middleware } from "koa";
import Router from "@koa/router";
import compose from "koa-compose";
import { input } from "@latticexyz/store-sync/indexer-client";
import { storeTables } from "@latticexyz/store-sync";
import { queryLogs } from "./queryLogs";
import { recordToLog } from "./recordToLog";
import { debug } from "../debug";
import { createBenchmark } from "@latticexyz/common";
import { compress } from "../compress";

export function apiRoutes(database: Sql): Middleware {
  const router = new Router();

  router.get("/api/logs", compress(), async (ctx) => {
    const benchmark = createBenchmark("postgres:logs");

    try {
      const opts = input.parse(typeof ctx.query.input === "string" ? JSON.parse(ctx.query.input) : {});
      opts.filters = opts.filters.length > 0 ? [...opts.filters, { tableId: storeTables.Tables.tableId }] : [];
      benchmark("parse config");

      const records = await queryLogs(database, opts ?? {}).execute();
      benchmark("query records");

      const logs = records.map(recordToLog);
      benchmark("map records to logs");

      const blockNumber = records[0]?.chainBlockNumber ?? "-1";

      ctx.body = JSON.stringify({ blockNumber, logs });
      ctx.status = 200;
    } catch (error) {
      ctx.status = 500;
      ctx.body = JSON.stringify(error);
      debug(error);
    }
  });

  return compose([router.routes(), router.allowedMethods()]) as Middleware;
}
