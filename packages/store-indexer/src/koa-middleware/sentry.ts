import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { stripUrlQueryAndFragment } from "@sentry/utils";
import { debug } from "../debug";
import Koa from "koa";
import compose from "koa-compose";

export function errorHandler(): Koa.Middleware {
  return async function errorHandlerMiddleware(ctx, next) {
    try {
      await next();
    } catch (err) {
      Sentry.withScope((scope) => {
        scope.addEventProcessor((event) => {
          return Sentry.addRequestDataToEvent(event, {
            ...ctx.request,
            body: ctx.request.body as string | Record<string, unknown> | undefined,
            query: ctx.request.query as Record<string, unknown> | undefined,
          });
        });
        Sentry.captureException(err);
      });
      throw err;
    }
  };
}

export function requestHandler(): Koa.Middleware {
  return async function requestHandlerMiddleware(ctx, next) {
    await Sentry.runWithAsyncContext(async () => {
      const hub = Sentry.getCurrentHub();
      hub.configureScope((scope) =>
        scope.addEventProcessor((event) =>
          Sentry.addRequestDataToEvent(event, {
            ...ctx.request,
            body: ctx.request.body as string | Record<string, unknown> | undefined,
            query: ctx.request.query as Record<string, unknown> | undefined,
          }),
        ),
      );
      await next();
    });
  };
}

export function tracing(): Koa.Middleware {
  // creates a Sentry transaction per request
  return async function tracingMiddleware(ctx, next) {
    const reqMethod = (ctx.method || "").toUpperCase();
    const reqUrl = ctx.url && stripUrlQueryAndFragment(ctx.url);

    // Connect to trace of upstream app
    let traceparentData;
    if (ctx.request.get("sentry-trace")) {
      traceparentData = Sentry.extractTraceparentData(ctx.request.get("sentry-trace"));
    }

    const transaction = Sentry.startTransaction({
      name: `${reqMethod} ${reqUrl}`,
      op: "http.server",
      ...traceparentData,
    });

    ctx.__sentry_transaction = transaction;

    // We put the transaction on the scope so users can attach children to it
    Sentry.getCurrentHub().configureScope((scope) => {
      scope.setSpan(transaction);
    });

    ctx.res.on("finish", () => {
      // Push `transaction.finish` to the next event loop so open spans have a chance to finish before the transaction closes
      setImmediate(() => {
        // If you're using koa router, set the matched route as transaction name
        if (ctx._matchedRoute) {
          const mountPath = ctx.mountPath || "";
          transaction.setName(`${reqMethod} ${mountPath}${ctx._matchedRoute}`);
        }

        transaction.setHttpStatus(ctx.status);
        transaction.finish();
      });
    });

    await next();
  };
}

export function sentry(dsn: string): Koa.Middleware {
  debug("Initializing Sentry");
  Sentry.init({
    dsn,
    integrations: [
      // Automatically instrument Node.js libraries and frameworks
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
      new ProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  return compose([errorHandler(), requestHandler(), tracing()]);
}
