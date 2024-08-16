import { Address, Client, MaybePromise } from "viem";
import { LruMap } from "./LruMap";
import { getAction } from "viem/utils";
import { getTransactionCount } from "viem/actions";

export type CreateNonceManagerParameters = {
  source: NonceManagerSource;
};

type FunctionParameters = {
  address: Address;
  chainId: number;
};

export type NonceManager = {
  /** Get and increment a nonce. */
  consume: (parameters: FunctionParameters & { client: Client }) => Promise<number>;
  /** Increment a nonce. */
  increment: (chainId: FunctionParameters) => void;
  /** Get a nonce. */
  get: (chainId: FunctionParameters & { client: Client }) => Promise<number>;
  /** Reset a nonce. */
  reset: (chainId: FunctionParameters) => void;
};

/**
 * Creates a nonce manager for auto-incrementing transaction nonces.
 *
 * - Docs: https://viem.sh/docs/accounts/createNonceManager
 *
 * @example
 * ```ts
 * const nonceManager = createNonceManager({
 *   source: jsonRpc(),
 * })
 * ```
 */
export function createNonceManager(parameters: CreateNonceManagerParameters): NonceManager {
  const { source } = parameters;

  const deltaMap = new Map();
  const nonceMap = new LruMap<string, number>(8192);
  const promiseMap = new Map<string, Promise<number>>();

  const getKey = ({ address, chainId }: FunctionParameters): string => `${address}.${chainId}`;

  return {
    async consume({ address, chainId, client }): Promise<number> {
      const key = getKey({ address, chainId });
      const promise = this.get({ address, chainId, client });

      this.increment({ address, chainId });
      const nonce = await promise;

      await source.set({ address, chainId }, nonce);
      nonceMap.set(key, nonce);

      return nonce;
    },
    async increment({ address, chainId }): Promise<void> {
      const key = getKey({ address, chainId });
      const delta = deltaMap.get(key) ?? 0;
      deltaMap.set(key, delta + 1);
    },
    async get({ address, chainId, client }): Promise<number> {
      const key = getKey({ address, chainId });

      let promise = promiseMap.get(key);
      if (!promise) {
        promise = (async (): Promise<number> => {
          try {
            const nonce = await source.get({ address, chainId, client });
            const previousNonce = nonceMap.get(key) ?? 0;
            if (previousNonce > 0 && nonce <= previousNonce) {
              console.log("###");
              console.log("returning incremented previous nonce");
              console.log("###");
              return previousNonce + 1;
            }
            nonceMap.delete(key);
            return nonce;
          } finally {
            this.reset({ address, chainId });
          }
        })();
        promiseMap.set(key, promise);
      }

      const delta = deltaMap.get(key) ?? 0;
      return delta + (await promise);
    },
    reset({ address, chainId }): void {
      const key = getKey({ address, chainId });
      deltaMap.delete(key);
      promiseMap.delete(key);
      nonceMap.delete(key);
    },
  };
}

////////////////////////////////////////////////////////////////////////////////////////////
// Sources

export type NonceManagerSource = {
  /** Get a nonce. */
  get(parameters: FunctionParameters & { client: Client }): MaybePromise<number>;
  /** Set a nonce. */
  set(parameters: FunctionParameters, nonce: number): MaybePromise<void>;
};

/** JSON-RPC source for a nonce manager. */
export function jsonRpc(): NonceManagerSource {
  return {
    async get(parameters): Promise<number> {
      const { address, client } = parameters;
      return getAction(
        client,
        getTransactionCount,
        "getTransactionCount",
      )({
        address,
        blockTag: "pending",
      });
    },
    set(): void {},
  };
}

////////////////////////////////////////////////////////////////////////////////////////////
// Default

/** Default Nonce Manager with a JSON-RPC source. */
export const nonceManager = /*#__PURE__*/ createNonceManager({
  source: jsonRpc(),
});
