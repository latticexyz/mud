/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseContract, BigNumberish, CallOverrides, Overrides } from "ethers";
import { autorun, computed, IComputedValue, IObservableValue, observable, runInAction } from "mobx";
import { mapObject, deferred, uuid, awaitValue, cacheUntilReady, extractEncodedArguments } from "@latticexyz/utils";
import { Mutex } from "async-mutex";
import { TransactionResponse } from "@ethersproject/providers";
import { Contracts, TxQueue } from "./types";
import { ConnectionState } from "./createProvider";
import { Network } from "./createNetwork";
import { getRevertReason } from "./networkUtils";

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
  computedContracts: IComputedValue<C> | IObservableValue<C>,
  network: Network,
  options?: { concurrency?: number; devMode?: boolean }
): { txQueue: TxQueue<C>; dispose: () => void; ready: IComputedValue<boolean | undefined> } {
  const { concurrency } = options || {};
  const queue = createPriorityQueue<{
    execute: (nonce: number, gasLimit: BigNumberish) => Promise<TransactionResponse>;
    estimateGas: () => BigNumberish | Promise<BigNumberish>;
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

    // Create a function that estimates gas if no gas is provided
    const gasLimit = overrides["gasLimit"];
    const estimateGas =
      gasLimit == null ? () => 10_000_000 || target.estimateGas[prop as string](...args) : () => gasLimit;

    // Create a function that executes the tx when called
    const execute = async (nonce: number, gasLimit: BigNumberish) => {
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

        const configOverrides = { ...overrides, nonce, gasLimit };
        if (options?.devMode) configOverrides.gasPrice = 10;

        const result = await member(...argsWithoutOverrides, configOverrides);
        resolve(result);
        return result;
      } catch (e) {
        reject(e as Error);
        throw e; // Rethrow error to catch when processing the queue
      }
    };

    // Queue the tx execution
    queue.add(uuid(), { execute, estimateGas, cancel: () => reject(new Error("TX_CANCELLED")), stateMutability });

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

    // Run exclusive to avoid two tx requests awaiting the nonce in parallel and submitting with the same nonce.
    let gasLimit: BigNumberish | undefined;
    try {
      gasLimit = await txRequest.estimateGas();
    } catch (e: any) {
      console.warn("TXQUEUE: gas estimation failed, tx not sent.", e);
      console.warn(e.reason);
    }

    const txResult = await submissionMutex.runExclusive(async () => {
      // Don't attempt to send the tx if gas estimation failed
      if (gasLimit == null) return;

      // Define variables in scope visible to finally block
      let error: any;
      const stateMutability = txRequest.stateMutability;

      try {
        // Wait if nonce is not ready
        const { nonce } = await awaitValue(readyState);
        // Await gas estimation to avoid increasing nonce before tx is actually sent
        return await txRequest.execute(nonce, gasLimit);
      } catch (e: any) {
        console.warn("TXQUEUE EXECUTION FAILED", e);
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

        console.log("TxQueue:", {
          error,
          isNonViewTransaction,
          shouldIncreaseNonce,
          shouldResetNonce,
        });

        // Nonce handeling
        if (shouldIncreaseNonce) incNonce();
        if (shouldResetNonce) await resetNonce();
      }
    });

    // Await confirmation
    if (txResult?.hash) {
      try {
        await txResult.wait();
      } catch (e) {
        console.warn("tx failed in block", e);

        // Decode and log the revert reason.
        // Use `then` instead of `await` to avoid letting consumers wait.
        getRevertReason(txResult.hash, network.providers.get().json).then((reason) =>
          console.warn("Revert reason:", reason)
        );

        const params = new URLSearchParams(window.location.search);
        const worldAddress = params.get("worldAddress");
        // Log useful commands that can be used to replay this tx
        const trace = `mud trace --config deploy.json --world ${worldAddress} --tx ${txResult.hash}`;
        const call = `mud call-system --world ${worldAddress} --caller ${network.connectedAddress.get()} --calldata ${extractEncodedArguments(
          txResult.data
        )} --systemId <SYSTEM_ID>`;

        console.log("---------- DEBUG COMMANDS (RUN IN TERMINAL) -------------");
        console.log("Trace:");
        console.log(trace);
        console.log("//");
        console.log("Call system:");
        console.log(call);
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
