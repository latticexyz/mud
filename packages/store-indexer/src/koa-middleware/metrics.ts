import { Middleware } from "koa";
import promClient from "prom-client";

type MetricsOptions = {
  isHealthy?: () => boolean;
  isReady?: () => boolean;
};

/**
 * Middleware to add Prometheus metrics endpoints
 */
export function metrics({ isHealthy, isReady }: MetricsOptions = {}): Middleware {
  promClient.collectDefaultMetrics();
  if (isHealthy != null) {
    new promClient.Gauge({
      name: "health_status",
      help: "Health status (0 = unhealthy, 1 = healthy)",
      collect(): void {
        this.set(Number(isHealthy()));
      },
    });
  }

  if (isReady != null) {
    new promClient.Gauge({
      name: "readiness_status",
      help: "Readiness status (whether the service is ready to receive requests, 0 = not ready, 1 = ready)",
      collect(): void {
        this.set(Number(isReady()));
      },
    });
  }

  return async function metricsMiddleware(ctx, next): Promise<void> {
    if (ctx.path === "/metrics") {
      ctx.status = 200;
      ctx.body = await promClient.register.metrics();
      return;
    }

    await next();
  };
}
