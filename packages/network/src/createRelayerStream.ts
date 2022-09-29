import { Message } from "@latticexyz/services/protobuf/ts/ecs-relay/ecs-relay";
import { ECSRelayServiceClient } from "@latticexyz/services/protobuf/ts/ecs-relay/ecs-relay.client";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { ethers, Signer } from "ethers";
import { keccak256 } from "ethers/lib/utils";
import { from, map } from "rxjs";

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

  // Signature that should be used to prove identity
  const signature = {
    signature: await signer.signMessage("ecs-relay-service"),
  };
  // Message payload to sign and use to recover signer
  const messagePayload = (msg: Message): string => {
    return `(${msg.version},${msg.id},${keccak256(msg.data)},${msg.timestamp})`;
  };

  await relayerClient.authenticate(signature);

  // Subscribe to the stream of relayed events
  const stream = relayerClient.openStream(signature);
  const event$ = from(stream.responses).pipe(
    map((msg) => {
      const recoveredAddress = ethers.utils.verifyMessage(messagePayload(msg), msg.signature);
      return {
        message: msg,
        address: recoveredAddress,
      };
    })
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
    // Message payload
    const msgVersion = 1;
    const msgId = id + Date.now();
    const msgTimestamp = BigInt(Date.now());
    const msgDataHash = keccak256(data);

    // Signature of the above message payload
    const msgSignature = await signer.signMessage(`(${msgVersion},${msgId},${msgDataHash},${msgTimestamp})`);

    relayerClient.push({
      label,
      message: {
        version: msgVersion,
        id: msgId,
        data: data,
        timestamp: msgTimestamp,
        signature: msgSignature,
      },
    });
  }

  return { event$, dispose, subscribe, unsubscribe, push };
}
