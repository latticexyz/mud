import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { initCache } from "../../initCache";
import { ECSStateReply } from "../../protogen/ecs-snapshot";
import { ECSStateSnapshotServiceClient } from "../../protogen/ecs-snapshot.client";
import { getCacheId } from "../utils";

const MAX_CACHE_AGE = 1000;

export type SchemaCache = ReturnType<typeof getIndexDbSchemaCache>;

export async function getCheckpoint(
  checkpointServiceUrl: string,
  cache: ReturnType<typeof initCache>,
  cacheBlockNumber: number,
  worldAddress: string
): Promise<ECSStateReply | undefined> {
  try {
    // Fetch remote block number
    const transport = new GrpcWebFetchTransport({ baseUrl: checkpointServiceUrl, format: "binary" });
    const client = new ECSStateSnapshotServiceClient(transport);
    const {
      response: { blockNumber: remoteBlockNumber },
    } = await client.getStateBlockLatest({ worldAddress });

    // Ignore checkpoint if local cache is recent enough
    const cacheAge = remoteBlockNumber - cacheBlockNumber;
    if (cacheAge < MAX_CACHE_AGE) return undefined;

    // Check local checkpoint
    const localCheckpoint: ECSStateReply = await cache.get("Checkpoint", "latest");
    const localCheckpointAge = remoteBlockNumber - (localCheckpoint.blockNumber ?? 0);
    // Return local checkpoint if it is recent enough
    if (localCheckpointAge < MAX_CACHE_AGE) {
      console.log("Local checkpoint is recent enough to be used");
      return localCheckpoint;
    }
    console.log("Fetching remote checkpoint");
    const { response: remoteCheckpoint } = await client.getStateLatest({ worldAddress });
    cache.set("Checkpoint", "latest", remoteCheckpoint, true);
    return remoteCheckpoint;
  } catch (e) {
    console.warn("Failed to fetch from checkpoint service:", e);
  }
}

export function getIndexDbSchemaCache(chainId: number, worldAddress: string, version?: number, idb?: IDBFactory) {
  return initCache<{ ComponentSchemas: [string[], number[]] }>(
    getCacheId("SchemaCache", chainId, worldAddress),
    ["ComponentSchemas"],
    version,
    idb
  );
}
