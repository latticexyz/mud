import { Signer } from "ethers";
import { from, map, Subject } from "rxjs";
import { spawn } from "threads";
import { messagePayload } from "./utils";
import { createChannel, createClient } from "nice-grpc-web";
import { awaitPromise, awaitStreamValue } from "@latticexyz/utils";
import grpcweb from "@improbable-eng/grpc-web";
import { ECSRelayServiceDefinition, Message, PushRequest } from "@latticexyz/services/ecs-relay";

/**
 * Create a RelayService connection, including event$ and utils
 * @param url ECSRelayService URL
 * @param id User id (eg address)
 * @returns RelayService connection
 */
export async function createRelayStream(signer: Signer, url: string, id: string) {
  const httpClient = createClient(ECSRelayServiceDefinition, createChannel(url));
  const wsClient = createClient(ECSRelayServiceDefinition, createChannel(url, grpcweb.grpc.WebsocketTransport()));

  const recoverWorker = await spawn(
    new Worker(new URL("./workers/Recover.worker.js", import.meta.url), { type: "module" })
  );

  // Signature that should be used to prove identity
  const signature = { signature: await signer.signMessage("ecs-relay-service") };
  await httpClient.authenticate(signature);

  // Subscribe to the stream of relayed events
  const event$ = from(wsClient.openStream(signature)).pipe(
    map(async (message) => ({
      message,
      address: await recoverWorker.recoverAddress(message),
    })),
    awaitPromise()
  );

  // Subscribe to new labels
  function subscribe(label: string) {
    httpClient.subscribe({ signature, subscription: { label } });
  }

  // Unsubscribe from labels
  function unsubscribe(label: string) {
    httpClient.unsubscribe({ signature, subscription: { label } });
  }

  // Fetch amount of connected clients
  async function countConnected(): Promise<number> {
    const { count } = await httpClient.countConnected({});
    return count;
  }

  // Set up stream to push messages to the relay service
  const push$ = new Subject<PushRequest>();
  const generatorLoop = { done: false };

  async function* pushGenerator(): AsyncIterable<PushRequest> {
    while (!generatorLoop.done) {
      yield await awaitStreamValue(push$);
    }
  }

  // Open push stream
  const responseSubscription = from(wsClient.pushStream(pushGenerator())).subscribe();

  function dispose() {
    generatorLoop.done = true;
    responseSubscription?.unsubscribe();
  }

  // Expose method for consumers to push data through the stream
  async function push(label: string, data: Uint8Array) {
    const message: Message = { version: 1, id: Date.now() + id, timestamp: Date.now(), data, signature: "" };
    message.signature = await signer.signMessage(messagePayload(message));
    push$.next({ label, message });
  }

  // Expose method for consumers to ping the stream to keep receiving messages without pushing
  function ping() {
    return httpClient.ping(signature);
  }

  return { event$, dispose, subscribe, unsubscribe, push, countConnected, ping };
}
