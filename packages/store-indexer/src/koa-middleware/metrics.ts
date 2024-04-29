import { Middleware } from "koa";
import promClient from "prom-client";

type MetricsOptions = {
  isHealthy?: () => boolean;
  isReady?: () => boolean;
  getLatestStoredBlockNumber?: () => Promise<bigint | undefined>;
  getDistanceFromFollowBlock?: () => Promise<bigint>;
  followBlockTag?: "latest" | "safe" | "finalized";
};

/**
 * Middleware to add Prometheus metrics endpoints
 */
export function metrics({
  isHealthy,
  isReady,
  getLatestStoredBlockNumber,
  getDistanceFromFollowBlock,
  followBlockTag,
}: MetricsOptions = {}): Middleware {
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

  if (getLatestStoredBlockNumber != null) {
    new promClient.Gauge({
      name: "latest_stored_block_number",
      help: "Latest block number stored in the database",
      async collect(): Promise<void> {
        this.set(Number(await getLatestStoredBlockNumber()));
      },
    });
  }

  if (followBlockTag != null) {
    const blockTagGauge = new promClient.Gauge({
      name: "follow_block_tag",
      help: "Block tag the indexer is following (0 = finalized, 1 = safe, 2 = latest)",
    });
    const blockTagToValue = {
      finalized: 0,
      safe: 1,
      latest: 2,
    };
    blockTagGauge.set(blockTagToValue[followBlockTag]);
  }

  if (getDistanceFromFollowBlock != null) {
    new promClient.Gauge({
      name: "distance_from_follow_block",
      help: "Block distance from the block tag this the indexer is following",
      async collect(): Promise<void> {
        this.set(Number(await getDistanceFromFollowBlock()));
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
