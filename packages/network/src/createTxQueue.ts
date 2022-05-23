/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseContract, CallOverrides, Overrides, Signer } from "ethers";
import { autorun, computed, IComputedValue, observable, runInAction } from "mobx";
import { Observable } from "rxjs";
import { mapObject, streamToComputed, deferred, uuid, awaitValue, cacheUntilReady } from "@mudkit/utils";
import { Mutex } from "async-mutex";
import { Provider, TransactionResponse } from "@ethersproject/providers";
import { Contracts, TxQueue } from "./types";

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
 * @param contracts$ A stream of contracts that should be channelled through the txQueue
 * @param options The concurrency declares how many transactions can wait for confirmation at the same time.
 * @returns
 */
export function createTxQueue<C extends Contracts>(
  contracts$: Observable<C>,
  signer$: Observable<Signer>,
  provider$: Observable<Provider>,
  connected$: Observable<boolean>,
  options?: { concurrency?: number; ignoreConfirmation?: boolean }
): { txQueue: TxQueue<C>; dispose: () => void; ready: IComputedValue<boolean | undefined> } {
  const { concurrency } = options || {};
  const queue = createPriorityQueue<{
    execute: (nonce: number) => Promise<TransactionResponse>;
    cancel: () => void;
    stateMutability?: string;
  }>();
  const submissionMutex = new Mutex();

  const _connected = streamToComputed(connected$);
  const _contracts = streamToComputed(contracts$);
  const _signer = streamToComputed(signer$);
  const _provider = streamToComputed(provider$);
  const _nonce = observable.box<number | null>(null);

  const readyState = computed(() => {
    const connected = _connected.get();
    const contracts = _contracts.get();
    const signer = _signer.get();
    const provider = _provider.get();
    const nonce = _nonce.get();

    if (!connected || !contracts || !signer || !provider || nonce == null) return undefined;
    return { contracts, signer, provider, nonce };
  });

  let utilization = 0;

  async function resetNonce() {
    runInAction(() => _nonce.set(null));
    const newNonce = (await _signer.get()?.getTransactionCount()) ?? null;
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
            `Internal TxQueue error: Member is not a function and should not be proxied. Tried to call "${prop}".`
          );
        }

        // TODO: only set gasPrice to 0 on local chain
        // (https://linear.app/latticexyz/issue/LAT-587/integrate-mud-reference-implementation-with-launcher)
        const result = await member(...argsWithoutOverrides, { ...overrides, nonce });
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
