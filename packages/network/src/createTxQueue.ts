/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseContract, BigNumberish, CallOverrides, Overrides } from "ethers";
import { autorun, computed, IComputedValue, IObservableValue, observable, runInAction } from "mobx";
import { mapObject, deferred, uuid, awaitValue, cacheUntilReady } from "@latticexyz/utils";
import { Mutex } from "async-mutex";
import { JsonRpcProvider, TransactionReceipt } from "@ethersproject/providers";
import { Contracts, TxQueue } from "./types";
import { ConnectionState } from "./createProvider";
import { Network } from "./createNetwork";
import { getRevertReason } from "./networkUtils";
import { BehaviorSubject } from "rxjs";

type ReturnTypeStrict<T> = T extends (...args: any) => any ? ReturnType<T> : never;

/**
 * The TxQueue takes care of nonce management, concurrency and caching calls if the contracts are not connected.
 * Cached calls are passed to the queue once the contracts are available.
 *
 * @param computedContracts A computed object containing the contracts to be channelled through the txQueue
 * @param network A network object containing provider, signer, etc
 * @param options The concurrency declares how many transactions can wait for confirmation at the same time.
 * @returns TxQueue object
 */
export function createTxQueue<C extends Contracts>(
  computedContracts: IComputedValue<C> | IObservableValue<C>,
  network: Network,
  gasPrice$: BehaviorSubject<number>,
  options?: { concurrency?: number; devMode?: boolean }
): { txQueue: TxQueue<C>; dispose: () => void; ready: IComputedValue<boolean | undefined> } {
  const { concurrency } = options || {};

  const queue = createPriorityQueue<{
    execute: (
      nonce: number,
      gasLimit: BigNumberish
    ) => Promise<{ hash: string; wait: () => Promise<TransactionReceipt> }>;
    estimateGas: () => BigNumberish | Promise<BigNumberish>;
    cancel: (error: any) => void;
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
  ): Promise<{
    hash: string;
    wait: () => Promise<TransactionReceipt>;
    response: Promise<ReturnTypeStrict<typeof target[typeof prop]>>;
  }> {
    const [resolve, reject, promise] = deferred<{
      hash: string;
      wait: () => Promise<TransactionReceipt>;
      response: Promise<ReturnTypeStrict<typeof target[typeof prop]>>;
    }>();

    // Extract existing overrides from function call
    const hasOverrides = args.length > 0 && isOverrides(args[args.length - 1]);
    const overrides = (hasOverrides ? args[args.length - 1] : {}) as CallOverrides;
    const argsWithoutOverrides = hasOverrides ? args.slice(0, args.length - 1) : args;

    // Store state mutability to know when to increase the nonce
    const fragment = target.interface.fragments.find((fragment) => fragment.name === prop);
    const stateMutability = fragment && (fragment as { stateMutability?: string }).stateMutability;

    // Create a function that estimates gas if no gas is provided
    const gasLimit = overrides["gasLimit"];
    const estimateGas = gasLimit == null ? () => target.estimateGas[prop as string](...args) : () => gasLimit;

    // Create a function that executes the tx when called
    const execute = async (nonce: number, gasLimit: BigNumberish) => {
      try {
        const member = target.populateTransaction[prop as string];
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

        // Populate config
        const configOverrides = {
          gasPrice: gasPrice$.getValue(),
          ...overrides,
          nonce,
          gasLimit,
        };
        if (options?.devMode) configOverrides.gasPrice = 0;

        // Populate tx
        const populatedTx = await member(...argsWithoutOverrides, configOverrides);
        populatedTx.nonce = nonce;
        populatedTx.chainId = network.config.chainId;

        // Execute tx
        let hash: string;
        try {
          // Attempt to sign the transaction and send it raw for higher performance
          const signedTx = await target.signer.signTransaction(populatedTx);
          hash = await (target.provider as JsonRpcProvider).perform("sendTransaction", {
            signedTransaction: signedTx,
          });
        } catch (e) {
          // Some signers don't support signing without sending (looking at you MetaMask),
          // so sign+send using the signer as a fallback
          const tx = await target.signer.sendTransaction(populatedTx);
          hash = tx.hash;
        }
        const response = target.provider.getTransaction(hash) as Promise<ReturnTypeStrict<typeof target[typeof prop]>>;
        // This promise is awaited asynchronously in the tx queue and the action queue to catch errors
        const wait = async () => (await response).wait();

        // Resolved value goes to the initiator of the transaction
        resolve({ hash, wait, response });

        // Returned value gets processed inside the tx queue
        return { hash, wait };
      } catch (e) {
        reject(e as Error);
        throw e; // Rethrow error to catch when processing the queue
      }
    };

    // Queue the tx execution
    queue.add(uuid(), {
      execute,
      estimateGas,
      cancel: (error?: any) => reject(error ?? new Error("TX_CANCELLED")),
      stateMutability,
    });

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

    // Start processing another request from the queue
    // Note: we start processing again after increasing the utilization to process up to `concurrency` tx request in parallel.
    // At the end of this function after decreasing the utilization we call processQueue again trigger tx requests waiting for capacity.
    processQueue();

    // Run exclusive to avoid two tx requests awaiting the nonce in parallel and submitting with the same nonce.
    const txResult = await submissionMutex.runExclusive(async () => {
      // Define variables in scope visible to finally block
      let error: any;
      const stateMutability = txRequest.stateMutability;

      // Await gas estimation to avoid increasing nonce before tx is actually sent
      let gasLimit: BigNumberish;
      try {
        gasLimit = await txRequest.estimateGas();
      } catch (e) {
        console.error("[TXQueue] GAS ESTIMATION ERROR", e);
        return txRequest.cancel(e);
      }

      // Wait if nonce is not ready
      const { nonce } = await awaitValue(readyState);

      try {
        return await txRequest.execute(nonce, gasLimit);
      } catch (e: any) {
        console.warn("[TXQueue] TXQUEUE EXECUTION FAILED", e);
        // Nonce is handled centrally in finally block (for both failing and successful tx)
        error = e;
      } finally {
        // If the error includes information about the transaction,
        // then the transaction was submitted and the nonce needs to be
        // increased regardless of the error
        const isNonViewTransaction = error && "transaction" in error && txRequest.stateMutability !== "view";
        const shouldIncreaseNonce = (!error && stateMutability !== "view") || isNonViewTransaction;

        const shouldResetNonce =
          error &&
          (("code" in error && error.code === "NONCE_EXPIRED") ||
            JSON.stringify(error).includes("transaction already imported"));
        console.log(
          `[TXQueue] TX Sent (error=${!!error}, isMutationError=${!!isNonViewTransaction} incNonce=${!!shouldIncreaseNonce} resetNonce=${!!shouldResetNonce})`
        );
        // Nonce handeling
        if (shouldIncreaseNonce) incNonce();
        if (shouldResetNonce) await resetNonce();
        // Bubble up error
        if (error) txRequest.cancel(error);
      }
    });

    // Await confirmation
    if (txResult?.hash) {
      try {
        await txResult.wait();
      } catch (e) {
        console.warn("[TXQueue] tx failed in block", e);

        // Decode and log the revert reason.
        // Use `then` instead of `await` to avoid letting consumers wait.
        getRevertReason(txResult.hash, network.providers.get().json).then((reason) =>
          console.warn("[TXQueue] Revert reason:", reason)
        );

        const params = new URLSearchParams(window.location.search);
        const worldAddress = params.get("worldAddress");
        // Log useful commands that can be used to replay this tx
        const trace = `mud trace --config deploy.json --world ${worldAddress} --tx ${txResult.hash}`;

        console.log("---------- DEBUG COMMANDS (RUN IN TERMINAL) -------------");
        console.log("Trace:");
        console.log(trace);
        console.log("---------------------------------------------------------");
      }
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

/**
 * Simple priority queue
 * @returns priority queue object
 */
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

  function size(): number {
    return queue.size;
  }

  return { add, remove, setPriority, next, size };
}
