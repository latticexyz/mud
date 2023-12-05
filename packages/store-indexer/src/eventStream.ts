import Application, { Middleware } from "koa";
import { ServerSentEvents } from "@latticexyz/store-sync/sse";
import { CreateEventStreamResult, createEventStream } from "./createEventStream";

export function eventStream<events extends ServerSentEvents>(): Middleware<
  Application.DefaultState,
  Pick<CreateEventStreamResult<events>, "send">
> {
  return async function eventStreamMiddleware(ctx, next) {
    ctx.request.socket.setTimeout(0);
    ctx.req.socket.setNoDelay(true);
    ctx.req.socket.setKeepAlive(true);

    ctx.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const eventStream = createEventStream();
    ctx.send = eventStream.send;

    ctx.status = 200;
    ctx.body = eventStream.stream;

    await next();

    eventStream.end();
  };
}
