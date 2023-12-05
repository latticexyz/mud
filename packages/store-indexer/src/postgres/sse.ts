import { Sql } from "postgres";
import { Middleware } from "koa";
import Router from "@koa/router";
import compose from "koa-compose";
import { input } from "@latticexyz/store-sync/trpc-indexer";
import { compress } from "../compress";
import { eventStream } from "../eventStream";
import { storeTables } from "@latticexyz/store-sync";
import { queryLogs } from "./queryLogs";
import { decodeDynamicField } from "@latticexyz/protocol-parser";
import { Events } from "@latticexyz/store-sync/sse";

export function sse(database: Sql): Middleware {
  const router = new Router();

  router.get("/sse/logs", compress(), eventStream<Events>(), async (ctx) => {
    const opts = input.parse(typeof ctx.query.input === "string" ? JSON.parse(ctx.query.input) : {});
    opts.filters = opts.filters.length > 0 ? [...opts.filters, { tableId: storeTables.Tables.tableId }] : [];

    let hasEmittedConfig = false;

    // TODO: emit record block number via `id: ...` so we get free retries via `Last-Event-ID` header
    await queryLogs(database, opts ?? {}).cursor(100, async (rows) => {
      if (!hasEmittedConfig && rows.length) {
        ctx.send("config", {
          indexerVersion: rows[0].indexerVersion,
          chainId: rows[0].chainId,
          lastUpdatedBlockNumber: rows[0].chainBlockNumber,
          totalRows: rows[0].totalRows,
        });
        hasEmittedConfig = true;
      }

      rows.forEach((row) => {
        ctx.send("log", {
          // TODO: either properly encode bigints in a JSON-safe way or fix these types
          blockNumber: row.chainBlockNumber as unknown as bigint,
          address: row.address,
          eventName: "Store_SetRecord",
          args: {
            tableId: row.tableId,
            keyTuple: decodeDynamicField("bytes32[]", row.keyBytes),
            staticData: row.staticData ?? "0x",
            encodedLengths: row.encodedLengths ?? "0x",
            dynamicData: row.dynamicData ?? "0x",
          },
        });
      });
    });

    // TODO: subscribe + continue writing
  });

  return compose([router.routes(), router.allowedMethods()]) as Middleware;
}
