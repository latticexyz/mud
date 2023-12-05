import { Middleware } from "koa";

type HealthcheckOptions = {
  isHealthy?: () => boolean;
  isReady?: () => boolean;
};

/**
 * Middleware to add Kubernetes healthcheck endpoints
 */
export function healthcheck({ isHealthy, isReady }: HealthcheckOptions = {}): Middleware {
  return async function healthcheckMiddleware(ctx, next): Promise<void> {
    if (ctx.path === "/healthz") {
      if (isHealthy == null || isHealthy()) {
        ctx.status = 200;
        ctx.body = "healthy";
      } else {
        ctx.status = 503;
        ctx.body = "not healthy";
      }
      return;
    }

    if (ctx.path === "/readyz") {
      if (isReady == null || isReady()) {
        ctx.status = 200;
        ctx.body = "ready";
      } else {
        ctx.status = 503;
        ctx.body = "not ready";
      }
      return;
    }

    await next();
  };
}
