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
      options.filters = options.filters.length > 0 ? [...options.filters, { tableId: storeTables.Tables.tableId }] : [];
      const records = await queryLogs(database, options ?? {}).execute();
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
