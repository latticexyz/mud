import { Middleware } from "koa";
import Router from "@koa/router";
import compose from "koa-compose";
import { debug, error } from "./debug";

export function apiRoutes(): Middleware {
  const router = new Router();

  router.get("/api/dripX", async (ctx) => {
    try {
      // Do things
      ctx.status = 200;
      ctx.set("Content-Type", "application/json");
      debug("dripped");
      ctx.body = JSON.stringify({ status: "success" });
    } catch (e) {
      ctx.status = 500;
      ctx.set("Content-Type", "application/json");
      ctx.body = JSON.stringify(e);
      error(e);
    }
  });

  return compose([router.routes(), router.allowedMethods()]) as Middleware;
}
