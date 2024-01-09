import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { stripUrlQueryAndFragment } from "@sentry/utils";
import { debug } from "./debug";
import Koa from "koa";

const requestHandler: Koa.Middleware = (ctx, next) => {
  return new Promise<void>((resolve, reject) => {
    Sentry.runWithAsyncContext(async () => {
      const hub = Sentry.getCurrentHub();
      hub.configureScope((scope) =>
        scope.addEventProcessor((event) =>
          Sentry.addRequestDataToEvent(event, ctx.request, {
            include: {
              user: false,
            },
          })
        )
      );

      try {
        await next();
      } catch (err) {
        reject(err);
      }
      resolve();
    });
  });
};

// This tracing middleware creates a transaction per request
const tracingMiddleWare: Koa.Middleware = async (ctx, next) => {
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

const errorHandler: Koa.Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    Sentry.withScope((scope) => {
      scope.addEventProcessor((event) => {
        return Sentry.addRequestDataToEvent(event, ctx.request);
      });
      Sentry.captureException(err);
    });
    throw err;
  }
};

export const registerSentryMiddlewares = (server: Koa, dsn: string): void => {
  debug("Setting up Sentry");

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

  debug("Registering Sentry middlewares");

  server.use(errorHandler);
  server.use(requestHandler);
  server.use(tracingMiddleWare);
};
