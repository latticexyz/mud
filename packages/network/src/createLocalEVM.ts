/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseContract, BigNumber, CallOverrides, ethers, Overrides } from "ethers";
import { Address } from "@ethereumjs/util";
import { Common } from "@ethereumjs/common";
import { Buffer as BrowserBuffer } from "buffer/";
import { StateManager, DefaultStateManager } from "@ethereumjs/statemanager";
import { Transaction } from "@ethereumjs/tx";
import { VM } from "@ethereumjs/vm";
import { autorun, computed, IComputedValue, IObservableValue, observable, runInAction } from "mobx";
import { mapObject, deferred, uuid, awaitValue, cacheUntilReady, streamToComputed } from "@latticexyz/utils";
import { Contracts, LocalEVM } from "./types";
import { ConnectionState } from "./createProvider";
import { Network } from "./createNetwork";
import { JsonRpcProvider } from "@ethersproject/providers";
import { buffer } from "stream/consumers";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.Buffer = BrowserBuffer;

interface MUDStateManagerConfig {
  common: Common;
  provider: JsonRpcProvider;
}

const bufferFromHex = (hex: string) => {
  return Buffer.from(hex.slice(2), "hex");
};

const bufferToHex = (buff: Buffer) => {
  return "0x" + buff.toString("hex");
};

class MUDStateManager extends DefaultStateManager {
  provider: JsonRpcProvider;
  storageCache: { [key: string]: { [key: string]: string } };
  constructor(config: MUDStateManagerConfig) {
    super({ common: config.common });
    this.provider = config.provider;
    this.storageCache = {};
  }
  async getContractCode(address: Address): Promise<globalThis.Buffer> {
    console.log("getting contract code from network", bufferToHex(address.buf));
    const code = await this.provider.getCode(bufferToHex(address.buf));
    return bufferFromHex(code);
  }

  getStorageCache(address: Address, key: Buffer): Buffer | undefined {
    if (this.storageCache[bufferToHex(address.buf)]) {
      if (this.storageCache[bufferToHex(address.buf)][bufferToHex(key)]) {
        console.log("reading from cache", bufferToHex(address.buf), bufferToHex(key));
        return bufferFromHex(this.storageCache[bufferToHex(address.buf)][bufferToHex(key)]);
      }
    }
  }

  storeStorageCache(address: Address, key: Buffer, value: Buffer) {
    if (!this.storageCache[bufferToHex(address.buf)]) {
      this.storageCache[bufferToHex(address.buf)] = {};
    }
    console.log("writing to cache", bufferToHex(address.buf), bufferToHex(key), bufferToHex(value));
    this.storageCache[bufferToHex(address.buf)][bufferToHex(key)] = bufferToHex(value);
  }

  async getContractStorage(address: Address, key: Buffer): Promise<Buffer> {
    const maybeSlot = this.getStorageCache(address, key);
    if (maybeSlot !== undefined) {
      return maybeSlot;
    }
    const slot = bufferFromHex(await this.provider.getStorageAt(bufferToHex(address.buf), bufferToHex(key)));
    console.log("reading from network", bufferToHex(address.buf), bufferToHex(key), bufferToHex(slot));
    this.storeStorageCache(address, key, slot);
    return slot;
  }

  async putContractStorage(address: Address, key: Buffer, value: Buffer): Promise<void> {
    this.storeStorageCache(address, key, value);
  }
}

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
    const signer = network.signer.get()!;
    // const common = new Common({ chain: network.config.chainId });
    const common = new Common({ chain: 1 });
    const vm = await VM.create({ common, stateManager: new MUDStateManager({ common, provider }) });
    const contractArg = arg[0];
    const ethersTx = await contract.populateTransaction[key](...contractArg);
    // ethersTx.maxFeePerGas = 10 * 10 ** 9;
    console.log(ethersTx);
    ethersTx.gasPrice = BigNumber.from(10 * 10 ** 9);
    ethersTx.gasLimit = BigNumber.from(10_000_000);
    // ethersTx.nonce = await signer.getTransactionCount()
    ethersTx.nonce = 0;
    const signedTx = await signer.signTransaction(ethersTx);
    const buffer = bufferFromHex(signedTx);
    const tx = Transaction.fromSerializedTx(buffer);
    console.log(tx);
    const out = await vm.runTx({ tx, skipBalance: true });
    console.log(out);
  }

  function proxyContract<Contract extends C[keyof C]>(contract: Contract): Contract {
    return mapObject(contract as any, (value, key) => {
      // Relay all base contract methods to the original target
      if (key in BaseContract.prototype) return value;

      // Relay everything that is not a function call to the original target
      if (!(value instanceof Function)) return value;
      return (...args: unknown[]) => simulateCall(contract, key as keyof BaseContract, args);
    }) as Contract;
  }

  const proxiedContracts = computed(() => {
    const contracts = readyState.get()?.contracts;
    if (!contracts) return undefined;
    return mapObject(contracts, proxyContract);
  });

  // const run = async () => {
  //   const common = new Common({ chain: 1 });
  //   const vm = await VM.create({ common });

  //   const tx = Transaction.fromTxData({
  //     gasLimit: BigInt(21000),
  //     value: BigInt(1),
  //     to: Address.zero(),
  //     v: BigInt(37),
  //     r: BigInt("62886504200765677832366398998081608852310526822767264927793100349258111544447"),
  //     s: BigInt("21948396863567062449199529794141973192314514851405455194940751428901681436138"),
  //   });
  //   console.log("tx", tx);
  //   const out = await vm.runTx({ tx, skipBalance: true });
  //   console.log(out);
  // };
  // run();

  const cachedProxiedContracts = cacheUntilReady(proxiedContracts);

  return { localEVM: cachedProxiedContracts, dispose, ready: computed(() => (readyState ? true : undefined)) };
}
