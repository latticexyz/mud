import {
  BaseError,
  BlockTag,
  Hex,
  NonceTooHighError,
  NonceTooLowError,
  PublicClient,
  TransactionExecutionError,
} from "viem";
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
    if (!hasNonce()) throw new Error("call resetNonce before using nextNonce");
    const nonce = nonceRef.current++;
    channel?.postMessage(JSON.stringify(nonceRef.current));
    return nonce;
  }

  async function resetNonce(): Promise<void> {
    const nonce = await publicClient.getTransactionCount({ address, blockTag });
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

  return {
    hasNonce,
    nextNonce,
    resetNonce,
    shouldResetNonce,
  };
}
