/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseContract, CallOverrides, Overrides } from "ethers";
import { autorun, computed, IComputedValue, IObservableValue, observable, runInAction } from "mobx";
import { mapObject, deferred, uuid, awaitValue, cacheUntilReady } from "@latticexyz/utils";
import { Mutex } from "async-mutex";
import { TransactionResponse } from "@ethersproject/providers";
import { Contracts, LocalEVM } from "./types";
import { ConnectionState } from "./createProvider";
import { Network } from "./createNetwork";

export function createLocalEVM<C extends Contracts>(
  computedContracts: IComputedValue<C> | IObservableValue<C>,
  network: Network,
  options?: { devMode?: boolean }
): { localEVM: LocalEVM<C>; dispose: () => void; ready: IComputedValue<boolean | undefined> } {
  const dispose = () => {
    return;
  };

  const readyState = computed(() => {
    const connected = network.connected.get();
    const contracts = computedContracts.get();
    const signer = network.signer.get();
    const provider = network.providers.get()?.json;

    if (connected !== ConnectionState.CONNECTED || !contracts || !signer || !provider) return undefined;

    return { contracts, signer, provider };
  });

  const simulateCall = (...arg: any[]) => console.log(arg);

  function proxyContract<Contract extends C[keyof C]>(contract: Contract): Contract {
    return mapObject(contract as any, (value, key) => {
      // Relay all base contract methods to the original target
      if (key in BaseContract.prototype) return value;

      // Relay everything that is not a function call to the original target
      if (!(value instanceof Function)) return value;

      // Channel all contract specific methods through the queue
      return (...args: unknown[]) => simulateCall(contract, key as keyof BaseContract, args);
    }) as Contract;
  }

  const proxiedContracts = computed(() => {
    const contracts = readyState.get()?.contracts;
    if (!contracts) return undefined;
    return mapObject(contracts, proxyContract);
  });

  const cachedProxiedContracts = cacheUntilReady(proxiedContracts);

  return { localEVM: cachedProxiedContracts, dispose, ready: computed(() => (readyState ? true : undefined)) };
}
