import { FaucetServiceDefinition } from "@latticexyz/services/protobuf/ts/faucet/faucet";
import { createChannel, createClient, RawClient } from "nice-grpc-web";
import { FromTsProtoServiceDefinition } from "nice-grpc-web/lib/service-definitions/ts-proto";

/**
 * Create a FaucetServiceClient
 * @param url FaucetService URL
 * @returns FaucetServiceClient
 */
export function createFaucetService(
  url: string
): RawClient<FromTsProtoServiceDefinition<typeof FaucetServiceDefinition>> {
  return createClient(FaucetServiceDefinition, createChannel(url));
}
