import { QueryLayerClient, QueryLayerDefinition } from "@latticexyz/services/protobuf/ts/mode/mode";
import { createChannel, createClient } from "nice-grpc-web";

/**
 * Create a ECSStateSnapshotServiceClient
 * @param url ECSStateSnapshotService URL
 * @returns ECSStateSnapshotServiceClient
 */
export function createModeClient(url: string): QueryLayerClient {
  return createClient(QueryLayerDefinition, createChannel(url));
}
