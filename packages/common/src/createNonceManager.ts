import { BaseError, BlockTag, Client, Hex, NonceTooHighError, NonceTooLowError } from "viem";
import { debug as parentDebug } from "./debug";
import { getNonceManagerId } from "./getNonceManagerId";
import { getTransactionCount } from "viem/actions";
import PQueue from "p-queue";

const debug = parentDebug.extend("createNonceManager");

export type CreateNonceManagerOptions = {
  client: Client;
  address: Hex;
  blockTag?: BlockTag;
  broadcastChannelName?: string;
};

export type CreateNonceManagerResult = {
  hasNonce: () => boolean;
  nextNonce: () => number;
  resetNonce: () => Promise<void>;
  shouldResetNonce: (error: unknown) => boolean;
  mempoolQueue: PQueue;
};

export function createNonceManager({
  client,
  address, // TODO: rename to account?
  blockTag = "pending",
  broadcastChannelName,
}: CreateNonceManagerOptions): CreateNonceManagerResult {
  const nonceRef = { current: -1 };
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
        nonceRef.current = nonce;
      });
    });
  }

  function hasNonce(): boolean {
    return nonceRef.current >= 0;
  }

  function nextNonce(): number {
    if (!hasNonce()) throw new Error("call resetNonce before using nextNonce");
    const nonce = nonceRef.current++;
    channel?.postMessage(JSON.stringify(nonceRef.current));
    return nonce;
  }

  async function resetNonce(): Promise<void> {
    const nonce = await getTransactionCount(client, { address, blockTag });
    nonceRef.current = nonce;
    channel?.postMessage(JSON.stringify(nonceRef.current));
    debug("reset nonce to", nonceRef.current);
  }

  function shouldResetNonce(error: unknown): boolean {
    return (
      error instanceof BaseError &&
      error.walk((e) => e instanceof NonceTooLowError || e instanceof NonceTooHighError) != null
    );
  }

  const mempoolQueue = new PQueue({ concurrency: 1 });

  return {
    hasNonce,
    nextNonce,
    resetNonce,
    shouldResetNonce,
    mempoolQueue,
  };
}
