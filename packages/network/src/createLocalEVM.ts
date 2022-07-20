/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseContract, CallOverrides, Overrides } from "ethers";
import { Address } from "@ethereumjs/util";
import { Common } from "@ethereumjs/common";
import { Transaction } from "@ethereumjs/tx";
import { VM } from "@ethereumjs/vm";
import { autorun, computed, IComputedValue, IObservableValue, observable, runInAction } from "mobx";
import { mapObject, deferred, uuid, awaitValue, cacheUntilReady, streamToComputed } from "@latticexyz/utils";
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

  async function simulateCall<Contract extends C[keyof C]>(contract: Contract, key: keyof BaseContract, ...arg: any[]) {
    const bytecode = (contract as any).bytecode as string;
    const provider = network.providers.get().json;
    console.log(contract);
    console.log(key);
    console.log(arg);
    console.log(bytecode);
  }

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
  const run = async () => {
    const common = new Common({ chain: 1 });
    const vm = await VM.create({ common });

    const tx = Transaction.fromTxData({
      gasLimit: BigInt(21000),
      value: BigInt(1),
      to: Address.zero(),
      v: BigInt(37),
      r: BigInt("62886504200765677832366398998081608852310526822767264927793100349258111544447"),
      s: BigInt("21948396863567062449199529794141973192314514851405455194940751428901681436138"),
    });
    console.log("tx", tx);
    const out = await vm.runTx({ tx, skipBalance: true });
    console.log(out);
  };
  run();

  const cachedProxiedContracts = cacheUntilReady(proxiedContracts);

  return { localEVM: cachedProxiedContracts, dispose, ready: computed(() => (readyState ? true : undefined)) };
}
