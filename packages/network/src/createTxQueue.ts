/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseContract, CallOverrides, Overrides } from "ethers";
import { autorun, computed, IComputedValue, observable, runInAction } from "mobx";
import { mapObject, deferred, uuid, awaitValue, cacheUntilReady } from "@latticexyz/utils";
import { Mutex } from "async-mutex";
import { TransactionResponse } from "@ethersproject/providers";
import { Contracts, Network, TxQueue } from "./types";
import { ConnectionState } from "./createProvider";

function createPriorityQueue<T>() {
  const queue = new Map<string, { element: T; priority: number }>();

  function queueByPriority() {
    // Entries with a higher priority get executed first
    return [...queue.entries()].sort((a, b) => (a[1].priority >= b[1].priority ? -1 : 1));
  }

  function add(id: string, element: T, priority = 1) {
    queue.set(id, { element, priority });
  }

  function remove(id: string) {
    queue.delete(id);
  }

  function setPriority(id: string, priority: number) {
    const entry = queue.get(id);
    if (!entry) return;
    queue.set(id, { ...entry, priority });
  }

  function next(): T | undefined {
    if (queue.size === 0) return;
    const [key, value] = queueByPriority()[0];
    queue.delete(key);
    return value.element;
  }

  return { add, remove, setPriority, next };
}

type ReturnTypeStrict<T> = T extends (...args: any) => any ? ReturnType<T> : never;

/**
 * The TxQueue takes care of nonce management, concurrency and caching calls if the contracts are not connected.
 * Cached calls are passed to the queue once the contracts are available.
 * @param computedContracts A computed object containing the contracts to be channelled through the txQueue
 * @param network A network object containing provider, signer, etc
 * @param options The concurrency declares how many transactions can wait for confirmation at the same time.
 * @returns
 */
export function createTxQueue<C extends Contracts>(
  computedContracts: IComputedValue<C>,
  network: Network,
  options?: { concurrency?: number; ignoreConfirmation?: boolean }
): { txQueue: TxQueue<C>; dispose: () => void; ready: IComputedValue<boolean | undefined> } {
  const { concurrency } = options || {};
  const queue = createPriorityQueue<{
    execute: (nonce: number) => Promise<TransactionResponse>;
    cancel: () => void;
    stateMutability?: string;
  }>();
  const submissionMutex = new Mutex();
  const _nonce = observable.box<number | null>(null);

  const readyState = computed(() => {
    const connected = network.connected.get();
    const contracts = computedContracts.get();
    const signer = network.signer.get();
    const provider = network.providers.get()?.json;
    const nonce = _nonce.get();

    if (connected !== ConnectionState.CONNECTED || !contracts || !signer || !provider || nonce == null)
      return undefined;

    return { contracts, signer, provider, nonce };
  });

  let utilization = 0;

  async function resetNonce() {
    runInAction(() => _nonce.set(null));
    const newNonce = (await network.signer.get()?.getTransactionCount()) ?? null;
    runInAction(() => _nonce.set(newNonce));
  }

  // Set the nonce on init and reset if the signer changed
  const dispose = autorun(resetNonce);

  function incNonce() {
    runInAction(() => {
      const currentNonce = _nonce.get();
      const newNonce = currentNonce == null ? null : currentNonce + 1;
      _nonce.set(newNonce);
    });
  }

  function queueCall(
    target: C[keyof C],
    prop: keyof C[keyof C],
    args: unknown[]
  ): Promise<ReturnTypeStrict<typeof target[typeof prop]>> {
    const [resolve, reject, promise] = deferred<ReturnTypeStrict<typeof target[typeof prop]>>();

    // Extract existing overrides from function call
    const hasOverrides = args.length > 0 && isOverrides(args[args.length - 1]);
    const overrides = (hasOverrides ? args[args.length - 1] : {}) as CallOverrides;
    const argsWithoutOverrides = hasOverrides ? args.slice(0, args.length - 1) : args;

    // Store state mutability to know when to increase the nonce
    const fragment = target.interface.fragments.find((fragment) => fragment.name === prop);
    const stateMutability = fragment && (fragment as { stateMutability?: string }).stateMutability;

    // Create a function that executes the tx when called
    const execute = async (nonce: number) => {
      try {
        const member = target[prop];
        if (member == undefined) {
          throw new Error("Member does not exist.");
        }

        if (!(member instanceof Function)) {
          throw new Error(
            `Internal TxQueue error: Member is not a function and should not be proxied. Tried to call "${String(
              prop
            )}".`
          );
        }

        const configOverrides = { ...overrides, nonce };
        if (network.config.chainId === 31337) configOverrides.gasPrice = 0;

        const result = await member(...argsWithoutOverrides, configOverrides);
        resolve(result);
        return result;
      } catch (e) {
        reject(e as Error);
        throw e; // Rethrow error to catch when processing the queue
      }
    };

    // Queue the tx execution
    queue.add(uuid(), { execute, cancel: () => reject(new Error("TX_CANCELLED")), stateMutability });

    // Start processing the queue
    processQueue();

    // Promise resolves when the transaction is confirmed and is rejected if the
    // transaction fails or is cancelled.
    return promise;
  }

  async function processQueue() {
    // Don't enter if at max capacity
    if (concurrency != null && utilization >= concurrency) return;

    // Check if there is a request to process
    const txRequest = queue.next();
    if (!txRequest) return;

    // Increase utilization to prevent executing more tx than allowed by capacity
    utilization++;
    const txResult = await submissionMutex.runExclusive(async () => {
      try {
        // Wait if nonce is not ready
        const { nonce } = await awaitValue(readyState);
        const resultPromise = txRequest.execute(nonce);
        if (txRequest.stateMutability !== "view") incNonce();
        if (!options?.ignoreConfirmation) return await resultPromise;
      } catch (e: any) {
        console.warn("TXQUEUE EXECUTION FAILED", e);
        // If the error includes information about the transaction,
        // then the transaction was submitted and the nonce needs to be
        // increased regardless of the error;
        if ("transaction" in e && txRequest.stateMutability !== "view") incNonce();
        if ("code" in e && e.code === "NONCE_EXPIRED") await resetNonce();
      }
    });

    // Await confirmation
    if (txResult?.hash) {
      const { provider } = await awaitValue(readyState);
      await provider.waitForTransaction(txResult.hash);
    }

    utilization--;

    // Check if there are any transactions waiting to be processed
    processQueue();
  }

  function proxyContract<Contract extends C[keyof C]>(contract: Contract): Contract {
    return mapObject(contract as any, (value, key) => {
      // Relay all base contract methods to the original target
      if (key in BaseContract.prototype) return value;

      // Relay everything that is not a function call to the original target
      if (!(value instanceof Function)) return value;

      // Channel all contract specific methods through the queue
      return (...args: unknown[]) => queueCall(contract, key as keyof BaseContract, args);
    }) as Contract;
  }

  const proxiedContracts = computed(() => {
    const contracts = readyState.get()?.contracts;
    if (!contracts) return undefined;
    return mapObject(contracts, proxyContract);
  });

  const cachedProxiedContracts = cacheUntilReady(proxiedContracts);

  return { txQueue: cachedProxiedContracts, dispose, ready: computed(() => (readyState ? true : undefined)) };
}

function isOverrides(obj: any): obj is Overrides {
  if (typeof obj !== "object" || Array.isArray(obj) || obj === null) return false;
  return (
    "gasLimit" in obj ||
    "gasPrice" in obj ||
    "maxFeePerGas" in obj ||
    "maxPriorityFeePerGas" in obj ||
    "nonce" in obj ||
    "type" in obj ||
    "accessList" in obj ||
    "customData" in obj ||
    "value" in obj ||
    "blockTag" in obj ||
    "from" in obj
  );
}
