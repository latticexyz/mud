import { FaucetServiceClient } from "@latticexyz/services/protobuf/ts/faucet/faucet.client";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";

/**
 * Create a FaucetServiceClient
 * @param url FaucetService URL
 * @returns FaucetServiceClient
 */
export function createFaucetService(url: string) {
  const transport = new GrpcWebFetchTransport({ baseUrl: url, format: "binary" });
  return new FaucetServiceClient(transport);
}
