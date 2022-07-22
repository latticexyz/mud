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
  bytecodes: { [key: string]: string };
}

const bufferFromHex = (hex: string) => {
  return Buffer.from(hex.slice(2), "hex");
};

const bufferToHex = (buff: Buffer) => {
  return "0x" + buff.toString("hex");
};

class MUDStateManager extends DefaultStateManager {
  provider: JsonRpcProvider;
  codeCache: { [key: string]: string };
  storageCache: { [key: string]: { [key: string]: string } };
  constructor(config: MUDStateManagerConfig) {
    super({ common: config.common });
    this.provider = config.provider;
    this.storageCache = {};
    this.codeCache = config.bytecodes;
    console.log(this.codeCache);
  }
  async getContractCode(address: Address): Promise<globalThis.Buffer> {
    const maybeCode = this.getCodeCache(address);
    if (maybeCode) {
      return maybeCode;
    }
    console.warn("getting contract code from network", bufferToHex(address.buf));
    const code = bufferFromHex(await this.provider.getCode(bufferToHex(address.buf)));
    this.storeCodeCache(address, code);
    return code;
  }

  getCodeCache(address: Address): Buffer | undefined {
    if (this.codeCache[bufferToHex(address.buf)]) {
      console.log("reading from code cache", bufferToHex(address.buf));
      return bufferFromHex(this.codeCache[bufferToHex(address.buf)]);
    }
  }

  storeCodeCache(address: Address, code: Buffer) {
    console.log("writing to code cache", bufferToHex(address.buf), bufferToHex(code));
    this.codeCache[bufferToHex(address.buf)] = bufferToHex(code);
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
    if (!contracts) return undefined;
    const bytecodes: { [key: string]: string } = {};
    for (const contractId of Object.keys(contracts)) {
      bytecodes[contracts[contractId].address] = (contracts[contractId] as any).bytecode;
    }
    // left to do
    // - give address: (Component, schema) dictionary to the MUD State Manager
    // - load the World bytecode and add it to the bytecode object
    // - 2 possibilities to mock components
    // A. mock the function calls directly, by abi encoding the reads using our cache; and changing our states on writes
    // there might be a way using the runHookm given it give access to its internal. We could somehow immediately return from a known CALL sig to a known component contract
    // with the right return value encoded in the return stack
    // pretty degen but it could work. I probably want to create a test case for this
    // B. dynamically providing storage slots for each component and their set + metaset. Might be a bit tricky given we need to mock quite a lot of storage slots
    // Notes on this:
    // * allows return true for all the writer storage slot
    // * return zero for indexers
    // * return the keccak hash of the id for id
    // * return 0 address for _owner
    // * return world address for _world
    // * entityToValue is easy:
    // - have a global bytecode cache and re-use between invocations

    if (connected !== ConnectionState.CONNECTED || !contracts || !signer || !provider) return undefined;

    return { contracts, signer, provider, bytecodes };
  });

  async function simulateCall<Contract extends C[keyof C]>(
    contract: Contract,
    bytecodes: { [key: string]: string },
    key: keyof BaseContract,
    ...arg: any[]
  ) {
    const provider = network.providers.get().json;
    const signer = network.signer.get()!;
    const common = new Common({ chain: 1 });
    const vm = await VM.create({ common, stateManager: new MUDStateManager({ common, provider, bytecodes }) });
    const contractArg = arg[0];
    const ethersTx = await contract.populateTransaction[key](...contractArg);
    ethersTx.gasPrice = BigNumber.from(10 * 10 ** 9);
    ethersTx.gasLimit = BigNumber.from(10_000_000);
    ethersTx.nonce = 0;
    const signedTx = await signer.signTransaction(ethersTx);
    const buffer = bufferFromHex(signedTx);
    const tx = Transaction.fromSerializedTx(buffer);
    const out = await vm.runTx({ tx, skipBalance: true });
    console.log(out);
  }

  function createProxyContrat<Contract extends C[keyof C]>(bytecodes: {
    [key: string]: string;
  }): (c: Contract) => Contract {
    const proxyContract = (contract: Contract): Contract => {
      return mapObject(contract as any, (value, key) => {
        // Relay all base contract methods to the original target
        if (key in BaseContract.prototype) return value;

        // Relay everything that is not a function call to the original target
        if (!(value instanceof Function)) return value;
        return (...args: unknown[]) => simulateCall(contract, bytecodes, key as keyof BaseContract, args);
      }) as Contract;
    };
    return proxyContract;
  }

  const proxiedContracts = computed(() => {
    const currentReadyState = readyState.get();
    if (!currentReadyState) return undefined;
    const { contracts, bytecodes } = currentReadyState;
    const proxyContract = createProxyContrat(bytecodes);
    return mapObject(contracts, proxyContract);
  });

  const cachedProxiedContracts = cacheUntilReady(proxiedContracts);

  return { localEVM: cachedProxiedContracts, dispose, ready: computed(() => (readyState ? true : undefined)) };
}
