import { ECSRelayServiceClient } from "@latticexyz/services/protobuf/ts/ecs-relay/ecs-relay.client";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { from } from "rxjs";

/**
 * Create a ECSRelayServiceClient
 * @param url ECSRelayService URL
 * @returns ECSRelayServiceClient
 */
export function createRelayerClient(url: string): ECSRelayServiceClient {
  const transport = new GrpcWebFetchTransport({ baseUrl: url, format: "binary" });
  return new ECSRelayServiceClient(transport);
}

/**
 * Create a RelayService connection, including event$ and utils
 * @param url ECSRelayService URL
 * @param id User id (eg address)
 * @returns RelayService connection
 */
export async function createRelayerStream(url: string, id: string) {
  const relayerClient = createRelayerClient(url);
  const identity = { name: id };
  await relayerClient.authenticate(identity);

  // Subscribe to the stream of relayed events
  const stream = relayerClient.openStream(identity);
  const event$ = from(stream.responses);

  // Ping every 15s to stay alive
  const keepAlive = setInterval(() => relayerClient.ping(identity), 15000);
  function dispose() {
    clearInterval(keepAlive);
  }

  // Subscribe to new labels
  function subscribe(label: string) {
    relayerClient.subscribe({ identity, subscription: { label } });
  }

  // Unsubscribe from labels
  function unsubscribe(label: string) {
    relayerClient.unsubscribe({ identity, subscription: { label } });
  }

  // Push data to subscribers
  function push(label: string, data: Uint8Array) {
    relayerClient.push({
      identity,
      label,
      messages: [{ version: 1, data, timestamp: BigInt(Date.now()), id: id + Date.now() }],
    });
  }

  return { event$, dispose, subscribe, unsubscribe, push };
}
