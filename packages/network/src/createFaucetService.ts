import { FaucetServiceDefinition } from "@latticexyz/services/protobuf/ts/faucet/faucet";
import { createChannel, createClient } from "nice-grpc-web";

/**
 * Create a FaucetServiceClient
 * @param url FaucetService URL
 * @returns FaucetServiceClient
 */
export function createFaucetService(url: string) {
  return createClient(FaucetServiceDefinition, createChannel(url));
}
