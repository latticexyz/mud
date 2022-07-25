/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseContract, BigNumber, CallOverrides, Contract, ethers, Overrides } from "ethers";
import { Address } from "@ethereumjs/util";
import { Common } from "@ethereumjs/common";
import { Buffer as BrowserBuffer } from "buffer/";
import { StateManager, DefaultStateManager } from "@ethereumjs/statemanager";
import { Transaction } from "@ethereumjs/tx";
import { VM } from "@ethereumjs/vm";
import { EVM } from "@ethereumjs/evm";
import { addressToBuffer } from "@ethereumjs/evm/src/opcodes/util";
import { Stack } from "@ethereumjs/evm/src/stack";
import { Component, getComponentValue, getComponentValueStrict, Type, World } from "@latticexyz/recs";
import { InterpreterStep } from "@ethereumjs/evm/src/interpreter";
import { autorun, computed, IComputedValue, IObservableValue, observable, runInAction } from "mobx";
import {
  mapObject,
  deferred,
  uuid,
  awaitValue,
  cacheUntilReady,
  streamToComputed,
  toEthAddress,
} from "@latticexyz/utils";
import { Contracts, LocalEVM } from "./types";
import { ConnectionState } from "./createProvider";
import { Network } from "./createNetwork";
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import WorldAbi from "@latticexyz/solecs/abi/World.json";
import ComponentAbi from "@latticexyz/solecs/abi/Component.json";
import { Component as ComponentContract, World as WorldContract } from "@latticexyz/solecs";
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

const addressToString = (addr: Address): string => {
  return "0x" + addr.buf.toString("hex");
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
      // console.log("reading from code cache", bufferToHex(address.buf));
      return bufferFromHex(this.codeCache[bufferToHex(address.buf)]);
    }
  }

  storeCodeCache(address: Address, code: Buffer) {
    // console.log("writing to code cache", bufferToHex(address.buf), bufferToHex(code));
    this.codeCache[bufferToHex(address.buf)] = bufferToHex(code);
  }

  getStorageCache(address: Address, key: Buffer): Buffer | undefined {
    if (this.storageCache[bufferToHex(address.buf)]) {
      if (this.storageCache[bufferToHex(address.buf)][bufferToHex(key)]) {
        // console.log("reading from cache", bufferToHex(address.buf), bufferToHex(key));
        return bufferFromHex(this.storageCache[bufferToHex(address.buf)][bufferToHex(key)]);
      }
    }
  }

  storeStorageCache(address: Address, key: Buffer, value: Buffer) {
    if (!this.storageCache[bufferToHex(address.buf)]) {
      this.storageCache[bufferToHex(address.buf)] = {};
    }
    // console.log("writing to cache", bufferToHex(address.buf), bufferToHex(key), bufferToHex(value));
    this.storageCache[bufferToHex(address.buf)][bufferToHex(key)] = bufferToHex(value);
  }

  async getContractStorage(address: Address, key: Buffer): Promise<Buffer> {
    const maybeSlot = this.getStorageCache(address, key);
    if (maybeSlot !== undefined) {
      return maybeSlot;
    }
    const slot = bufferFromHex(await this.provider.getStorageAt(bufferToHex(address.buf), bufferToHex(key)));
    console.warn("reading from network", bufferToHex(address.buf), bufferToHex(key), bufferToHex(slot));
    this.storeStorageCache(address, key, slot);
    return slot;
  }

  async putContractStorage(address: Address, key: Buffer, value: Buffer): Promise<void> {
    this.storeStorageCache(address, key, value);
  }
}

export function createLocalEVM<C extends Contracts>(
  computedContracts: IComputedValue<C> | IObservableValue<C>,
  worldAddress: string,
  world: World,
  systems: Component<{ value: Type.String }>,
  components: Component<{ value: Type.String }>,
  network: Network,
  options?: { devMode?: boolean }
): { localEVM: LocalEVM<C>; dispose: () => void; ready: IComputedValue<boolean | undefined> } {
  const dispose = () => {
    return;
  };

  async function getComponentAddress(componentId: string, provider: Provider) {
    // Otherwise fetch the address from the world
    const worldContract = new Contract(worldAddress, WorldAbi.abi, provider) as WorldContract;
    console.log("Fetching address for component", componentId);
    const componentAddressPromise = worldContract.getComponent(componentId);
    return componentAddressPromise;
  }

  async function getComponentSchema(address: string, provider: Provider): Promise<[string[], number[]]> {
    const componentContract = new Contract(address, ComponentAbi.abi, provider) as ComponentContract;
    const schema = await componentContract.getSchema();
    return schema;
  }

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
    // 1) add the component bytecode
    const addressToComponent: { [key: string]: Component } = {};
    for (const e of components.entities()) {
      const address = toEthAddress(world.entities[e]);
      const { value: id } = getComponentValueStrict(components, e);
      const bytecode = await provider.getCode(address);
      bytecodes[address] = bytecode;
      const componentIndex = world.components.findIndex((c) => {
        return c.metadata?.contractId === id;
      });
      if (componentIndex === -1) {
        console.warn("Ignoring non client component with id " + id);
      } else {
        addressToComponent[address] = world.components[componentIndex]!;
      }
    }
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    (vm.evm as EVM).on("step", (d) => {
      const data = d as InterpreterStep;
      if (data.opcode.name === "CALL" || data.opcode.name === "STATICCALL") {
        if (data.opcode.name === "STATICCALL") {
          const stack = new Stack();
          stack._store = data.stack;
          const [_currentGasLimit, toAddr, inOffset, inLength, outOffset, outLength] = stack.peek(6);
          const toAddress = new Address(addressToBuffer(toAddr));
          console.log(addressToString(toAddress));
          const c = addressToComponent[addressToString(toAddress)];
          if (c) {
            // we calling a component! time to trick the EVM
          }
        }
      }
    });

    // we can simplify this further by running an emv.runCall, no need to execute an entire tx!
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
