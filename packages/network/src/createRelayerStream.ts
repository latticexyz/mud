import { Message } from "@latticexyz/services/protobuf/ts/ecs-relay/ecs-relay";
import { ECSRelayServiceClient } from "@latticexyz/services/protobuf/ts/ecs-relay/ecs-relay.client";
import { awaitPromise } from "@latticexyz/utils";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { Signer } from "ethers";
import { from, map } from "rxjs";
import { spawn } from "threads";
import { messagePayload } from "./utils";

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
export async function createRelayerStream(signer: Signer, url: string, id: string) {
  const relayerClient = createRelayerClient(url);
  const recoverWorker = await spawn(
    new Worker(new URL("./workers/Recover.worker.ts", import.meta.url), { type: "module" })
  );

  // Signature that should be used to prove identity
  const signature = {
    signature: await signer.signMessage("ecs-relay-service"),
  };

  await relayerClient.authenticate(signature);

  // Subscribe to the stream of relayed events
  const stream = relayerClient.openStream(signature);
  const event$ = from(stream.responses).pipe(
    map(async (message) => ({
      message,
      address: await recoverWorker.recoverAddress(message),
    })),
    awaitPromise()
  );

  // Ping every 15s to stay alive
  const keepAlive = setInterval(() => relayerClient.ping(signature), 15000);
  function dispose() {
    clearInterval(keepAlive);
  }

  // Subscribe to new labels
  function subscribe(label: string) {
    relayerClient.subscribe({ signature, subscription: { label } });
  }

  // Unsubscribe from labels
  function unsubscribe(label: string) {
    relayerClient.unsubscribe({ signature, subscription: { label } });
  }

  // Push data to subscribers
  async function push(label: string, data: Uint8Array) {
    const message: Message = { version: 1, id: Date.now() + id, timestamp: BigInt(Date.now()), data, signature: "" };
    message.signature = await signer.signMessage(messagePayload(message));

    relayerClient.push({
      label,
      message,
    });
  }

  return { event$, dispose, subscribe, unsubscribe, push };
}
