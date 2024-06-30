import { Middleware } from "koa";

export function helloWorld(): Middleware {
  return async function helloWorldMiddleware(ctx, next): Promise<void> {
    if (ctx.path === "/") {
      ctx.status = 200;
      ctx.body = "emit HelloWorld();";
      return;
    }
    await next();
  };
}
