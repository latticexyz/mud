import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { Middleware } from "koa";
import Router from "@koa/router";
import compose from "koa-compose";
import { input } from "@latticexyz/store-sync/indexer-client";
import { schemasTable, tablesWithRecordsToLogs } from "@latticexyz/store-sync";
import { debug } from "../debug";
import { createBenchmark } from "@latticexyz/common";
import { compress } from "../koa-middleware/compress";
import { getTablesWithRecords } from "./getTablesWithRecords";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function apiRoutes(database: BaseSQLiteDatabase<"sync", any>): Middleware {
  const router = new Router();

  router.get("/api/logs", compress(), async (ctx) => {
    const benchmark = createBenchmark("sqlite:logs");

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
      options.filters = options.filters.length > 0 ? [...options.filters, { tableId: schemasTable.tableId }] : [];
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

  router.post("/api/sqlite-indexer", async (ctx) => {
    try {
      const queries = Array.isArray(ctx.request.body) ? ctx.request.body : [];
      if (queries.length === 0) {
        ctx.status = 400;
        ctx.body = JSON.stringify({ error: "No queries provided" });
        return;
      }

      const result = [];
      for (const { query } of queries) {
        const data = database.all(sql.raw(query)) as Record<string, unknown>[];
        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid query result");
        }

        if (data.length === 0) {
          result.push([]);
          continue;
        }

        if (!data[0]) {
          throw new Error("Invalid row data");
        }

        const columns = Object.keys(data[0]).map((key) => key.replaceAll("_", "").toLowerCase());
        const rows = data.map((row) => Object.values(row).map((value) => value?.toString() ?? ""));
        result.push([columns, ...rows]);
      }

      ctx.status = 200;
      ctx.body = JSON.stringify({ result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      ctx.status = 400;
      ctx.body = JSON.stringify({ error: errorMessage });
    }
  });

  return compose([router.routes(), router.allowedMethods()]) as Middleware;
}
