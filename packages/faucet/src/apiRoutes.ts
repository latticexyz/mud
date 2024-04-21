import { Middleware } from "koa";
import Router from "@koa/router";
import compose from "koa-compose";
import { debug, error } from "./debug";
import { FaucetContext } from "./common";
import { ZodError, z } from "zod";
import { isAddress } from "viem";
import { verifyDripPost } from "./verifyDripPost";
import { sendTransaction } from "viem/actions";

export const dripXSchema = z.object({
  username: z.string(),
  address: z.string().refine(isAddress),
});

export function apiRoutes({
  postContentPrefix,
  xApi,
  faucetClient,
  faucetAccount,
  dripAmount,
}: FaucetContext): Middleware {
  const router = new Router();

  router.post("/api/dripX", async (ctx) => {
    try {
      const { address, username } = dripXSchema.parse(ctx.request.body);
      if (!xApi) {
        throw new Error("X api not set up");
      }

      if (await verifyDripPost({ xApi, username, address, postContentPrefix })) {
        await sendTransaction(faucetClient, { account: faucetAccount, to: address, value: dripAmount, chain: null });
        // TODO: store user to prevent further drips

        ctx.status = 200;
        ctx.set("Content-Type", "application/json");
        ctx.body = JSON.stringify({ status: "success" });
        debug(`Successful drip to ${username} / ${address}`);
        return;
      }

      // Verification not successful
      ctx.status = 400;
      ctx.set("Content-Type", "application/json");
      ctx.body = JSON.stringify({ status: "failed" });
      return;
    } catch (e) {
      if (e instanceof ZodError) {
        ctx.status = 400;
        ctx.set("Content-Type", "application/json");
        ctx.body = e.flatten();
        return;
      }

      ctx.status = 500;
      ctx.set("Content-Type", "application/json");
      ctx.body = JSON.stringify({ status: "internal error" });
      error(e);
    }
  });

  return compose([router.routes(), router.allowedMethods()]) as Middleware;
}
