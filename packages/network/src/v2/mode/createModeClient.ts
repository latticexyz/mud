import { QueryLayerClient, QueryLayerDefinition } from "@latticexyz/services/mode";
import { createChannel, createClient } from "nice-grpc-web";

/**
 * Create a MODE QueryLayerClient
 * @param url MUDE URL
 * @returns MODE QueryLayerClient
 */
export function createModeClient(url: string): QueryLayerClient {
  return createClient(QueryLayerDefinition, createChannel(url));
}
