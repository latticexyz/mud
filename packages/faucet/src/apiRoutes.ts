import { Middleware } from "koa";
import Router from "@koa/router";
import compose from "koa-compose";
import { debug, error } from "./debug";
import { FaucetContext } from "./common";
import { signDripMessage } from "./signDripMessage";
import { ZodError, z } from "zod";
import { isAddress } from "viem";

export const dripXSchema = z.object({
  username: z.string(),
  address: z.string().refine(isAddress),
});

export function apiRoutes({ client, signMessagePrefix, account }: FaucetContext): Middleware {
  const router = new Router();

  router.post("/api/dripX", async (ctx) => {
    try {
      const { address, username } = dripXSchema.parse(ctx.request.body);
      debug("dripX request:", { address, username });

      const signature = await signDripMessage({ client, signMessagePrefix, account, username });

      debug("signature", signature);

      ctx.status = 200;
      ctx.set("Content-Type", "application/json");
      ctx.body = JSON.stringify({ status: "success" });
    } catch (e) {
      if (e instanceof ZodError) {
        ctx.status = 403;
        ctx.set("Content-Type", "application/json");
        ctx.body = e.flatten();
        return;
      }

      ctx.status = 500;
      ctx.set("Content-Type", "application/json");
      ctx.body = JSON.stringify(e);
      error(e);
    }
  });

  return compose([router.routes(), router.allowedMethods()]) as Middleware;
}
