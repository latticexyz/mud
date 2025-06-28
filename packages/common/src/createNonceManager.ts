import { BlockTag, Client, Hex } from "viem";
import { debug as parentDebug } from "./debug";
import { getNonceManagerId } from "./getNonceManagerId";
import { getTransactionCount } from "viem/actions";
import PQueue from "p-queue";
import { getAction } from "viem/utils";
import { findCause } from "./findCause";

const debug = parentDebug.extend("createNonceManager");

export type CreateNonceManagerOptions = {
  client: Client;
  address: Hex;
  blockTag?: BlockTag;
  broadcastChannelName?: string;
  queueConcurrency?: number;
};

export type CreateNonceManagerResult = {
  hasNonce: () => boolean;
  getNonce: () => number;
  nextNonce: () => number;
  resetNonce: () => Promise<void>;
  shouldResetNonce: (error: Error) => boolean;
  mempoolQueue: PQueue;
};

export function createNonceManager({
  client,
  address, // TODO: rename to account?
  blockTag = "latest",
  broadcastChannelName,
  queueConcurrency = 1,
}: CreateNonceManagerOptions): CreateNonceManagerResult {
  const ref = { nonce: -1, noncePromise: null as Promise<void> | null };
  let channel: BroadcastChannel | null = null;

  if (typeof BroadcastChannel !== "undefined") {
    const channelName = broadcastChannelName
      ? Promise.resolve(broadcastChannelName)
      : getNonceManagerId({ client, address, blockTag });
    channelName.then((name) => {
      channel = new BroadcastChannel(name);
      // TODO: emit some sort of "connected" event so other channels can broadcast current nonce
      channel.addEventListener("message", (event) => {
        const nonce = JSON.parse(event.data);
        debug("got nonce from broadcast channel", nonce);
        ref.nonce = nonce;
      });
    });
  }

  function hasNonce(): boolean {
    return ref.nonce >= 0;
  }

  function getNonce(): number {
    if (!hasNonce()) throw new Error("call resetNonce before using getNonce");
    return ref.nonce;
  }

  function nextNonce(): number {
    if (!hasNonce()) throw new Error("call resetNonce before using nextNonce");
    const nonce = ref.nonce++;
    channel?.postMessage(JSON.stringify(ref.nonce));
    return nonce;
  }

  async function resetNonce(): Promise<void> {
    ref.noncePromise ??= (async (): Promise<void> => {
      ref.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({ address, blockTag });
      ref.noncePromise = null;
      channel?.postMessage(JSON.stringify(ref.nonce));
      debug("reset nonce to", ref.nonce);
    })();
    await ref.noncePromise;
  }

  function shouldResetNonce(error: Error): boolean {
    const nonceError = findCause(error, ({ name }) => name === "NonceTooLowError" || name === "NonceTooHighError");
    return nonceError != null;
  }

  const mempoolQueue = new PQueue({ concurrency: queueConcurrency });

  return {
    hasNonce,
    getNonce,
    nextNonce,
    resetNonce,
    shouldResetNonce,
    mempoolQueue,
  };
}
