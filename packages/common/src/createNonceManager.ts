import { BlockTag, Hex, PublicClient } from "viem";
import { debug as parentDebug } from "./debug";

const debug = parentDebug.extend("createNonceManager");

type CreateNonceManagerOptions = {
  publicClient: PublicClient;
  address: Hex;
  blockTag?: BlockTag;
};

type CreateNonceManagerResult = {
  hasNonce: () => boolean;
  nextNonce: () => number;
  resetNonce: () => Promise<void>;
  shouldResetNonce: (error: unknown) => boolean;
};

export function createNonceManager({
  publicClient,
  address,
  blockTag,
}: CreateNonceManagerOptions): CreateNonceManagerResult {
  const nonceRef = { current: -1 };
  const channel =
    typeof BroadcastChannel !== "undefined"
      ? // TODO: fetch chain ID or require it via types?
        new BroadcastChannel(`mud:createNonceManager:${publicClient.chain?.id}:${address}`)
      : null;

  if (channel) {
    channel.addEventListener("message", (event) => {
      const nonce = JSON.parse(event.data);
      debug("got nonce from broadcast channel", nonce);
      nonceRef.current = nonce;
    });
  }

  function hasNonce(): boolean {
    return nonceRef.current >= 0;
  }

  function nextNonce(): number {
    const nonce = nonceRef.current++;
    channel?.postMessage(JSON.stringify(nonce));
    return nonce;
  }

  async function resetNonce(): Promise<void> {
    const nonce = await publicClient.getTransactionCount({ address, blockTag });
    nonceRef.current = nonce;
    channel?.postMessage(JSON.stringify(nonce));
    debug("reset nonce to", nonceRef.current);
  }

  function shouldResetNonce(error: unknown): boolean {
    return /already known|nonce too low/.test(String(error));
  }

  return {
    hasNonce,
    nextNonce,
    resetNonce,
    shouldResetNonce,
  };
}
