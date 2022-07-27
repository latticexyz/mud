/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseContract, BigNumber, CallOverrides, Contract, ethers, Overrides } from "ethers";
import { Address } from "@ethereumjs/util";
import { Common } from "@ethereumjs/common";
import { Buffer as BrowserBuffer } from "buffer/";
import { StateManager, DefaultStateManager } from "@ethereumjs/statemanager";
import { Transaction } from "@ethereumjs/tx";
import { VM } from "@ethereumjs/vm";
import { EVM } from "@ethereumjs/evm";
import { addressToBuffer, getDataSlice } from "@ethereumjs/evm/src/opcodes/util";
import { Stack } from "@ethereumjs/evm/src/stack";
import { Memory } from "@ethereumjs/evm/src/memory";
import {
  Component,
  ComponentValue,
  getComponentValue,
  getComponentValueStrict,
  getEntitiesWithValue,
  SchemaOf,
  Type,
  World,
} from "@latticexyz/recs";
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
  keccak256,
} from "@latticexyz/utils";
import { Contracts, ContractSchemaValue, ContractSchemaValueId, LocalEVM } from "./types";
import { ConnectionState } from "./createProvider";
import { Network } from "./createNetwork";
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import WorldAbi from "@latticexyz/solecs/abi/World.json";
import ComponentAbi from "@latticexyz/solecs/abi/Component.json";
import { Component as ComponentContract, World as WorldContract } from "@latticexyz/solecs";
import { createDecoder } from "./createDecoder";
import { BytesLike, defaultAbiCoder as abi } from "ethers/lib/utils"; // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

enum Selector {
  GET_ENTITIES_WITH_VALUE_RAW = "GET_ENTITIES_WITH_VALUE_RAW",
  GET_ENTITIES_WITH_VALUE = "GET_ENTITIES_WITH_VALUE",
  HAS = "HAS",
  GET_RAW_VALUE = "GET_RAW_VALUE",
  GET_VALUE = "GET_VALUE",
}

const bytes4 = (hex: string): string => {
  return hex.slice(0, 2 + 4 * 2);
};

const GET_ENTITIES_WITH_VALUE_RAW_SELECTOR = bytes4(keccak256("getEntitiesWithValue(bytes)"));
const HAS_SELECTOR = bytes4(keccak256("has(uint256)"));
const GET_RAW_VALUE_SELECTOR = bytes4(keccak256("getRawValue(uint256)"));
//TODO: Set and Remove

const KNOWN_SELECTOR: { [key: string]: Selector } = {
  [GET_ENTITIES_WITH_VALUE_RAW_SELECTOR]: Selector.GET_ENTITIES_WITH_VALUE_RAW,
  [HAS_SELECTOR]: Selector.HAS,
  [GET_RAW_VALUE_SELECTOR]: Selector.GET_RAW_VALUE,
};

const getKnownSelectorsForComponentWithSchema = (schema: [string[], number[]]): { [key: string]: Selector } => {
  console.log(schema[1].map((id: ContractSchemaValue) => ContractSchemaValueId[id]).join(","));
  const GET_ENTITIES_WITH_VALUE_SELECTOR = bytes4(
    keccak256(
      "getEntitiesWithValue(" + schema[1].map((id: ContractSchemaValue) => ContractSchemaValueId[id]).join(",") + ")"
    )
  );
  return {
    [GET_ENTITIES_WITH_VALUE_SELECTOR]: Selector.GET_ENTITIES_WITH_VALUE,
    ...KNOWN_SELECTOR,
  };
};

const readFromState = (
  component: Component,
  selector: Selector,
  calldata: string,
  schema: [string[], number[]]
): string => {
  const decoder = createDecoder(schema[0], schema[1]);
  if (selector === Selector.GET_ENTITIES_WITH_VALUE || selector === Selector.GET_ENTITIES_WITH_VALUE_RAW) {
    const value = decoder(calldata);
    const entitiesWithValue = getEntitiesWithValue(component, value as ComponentValue<SchemaOf<Component>>);
    const entities: string[] = [];
    entitiesWithValue.forEach((e) => entities.push(component.world.entities[e]));
    return abi.encode(["uint256[]"], [entities]);
  }
  return calldata;
  // throw new Error("unknown selector")
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
    // console.warn("reading from network", bufferToHex(address.buf), bufferToHex(key), bufferToHex(slot));
    this.storeStorageCache(address, key, slot);
    return slot;
  }

  async putContractStorage(address: Address, key: Buffer, value: Buffer): Promise<void> {
    this.storeStorageCache(address, key, value);
  }
}

const hashData = (data: InterpreterStep) => {
  const stackHash = keccak256(data.stack.map((a) => a.toString()).join(","));
  const returnStackHash = keccak256(data.returnStack.map((a) => a.toString()).join(","));
  const memoryHash = keccak256(bufferToHex(data.memory));
  const obj = {
    accountStateRoot: bufferToHex(data.account.stateRoot),
    stackHash,
    returnStackHash,
    memoryHash,
    codeAddress: addressToString(data.codeAddress),
    address: addressToString(data.address),
    pc: data.pc,
  };
  console.log(JSON.stringify(obj, null, 2));
  console.log("data hash: ", keccak256(JSON.stringify(obj, null, 2)));
};

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
    // 1) add the component bytecode to the bytecode cache and create the address => component mapping
    const addressToComponent: { [key: string]: Component } = {};
    const addressToSchema: { [key: string]: [string[], number[]] } = {};
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
        addressToSchema[address] = await getComponentSchema(address, provider);
      }
    }
    bytecodes[ethers.constants.AddressZero] =
      "0x6080604052348015600f57600080fd5b50604880601d6000396000f3fe6080604052348015600f57600080fd5b5000fea2646970667358221220ac8ad8a7dd9737160e7a86255271c7e599e7eb38aec8b70e50d7346afc63eab064736f6c63430008070033";
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
    let postCondition: ((stack: Stack, memory: Memory) => void) | undefined;
    let preReturn: ((stack: Stack, memory: Memory) => void) | undefined;
    let logN = 0;
    let pcPostcondition: undefined | number;
    let addressPostcondition: undefined | string;
    let tricked = false;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    (vm.evm as EVM).on("step", (d) => {
      const data = d as InterpreterStep;
      const stack = new Stack();
      stack._store = data.stack;
      const memory = new Memory();
      memory._store = data.memory;
      if (logN) {
        logN--;
        console.log(logN, data.pc, data.opcode);
        hashData(data);
      }
      if (postCondition && data.pc === pcPostcondition && addressToString(data.address) === addressPostcondition) {
        console.log("Executing postcondition");
        postCondition(stack, memory);
        hashData(data);
        console.log("clearing postcondition");
        postCondition = undefined;
        logN = 0;
      }
      if (data.opcode.name === "CALL" || data.opcode.name === "STATICCALL") {
        if (data.opcode.name === "STATICCALL" && !tricked) {
          // for now we can only trick once
          tricked = true;
          console.log(data.pc);
          console.log(stack._store.map((s) => s.toString()));
          const [_, toAddr, inOffset, inLength, outOffset, outLength] = stack.peek(6);
          console.log(inOffset, inLength, outOffset, outLength);
          const toAddress = addressToString(new Address(addressToBuffer(toAddr)));
          const c = addressToComponent[toAddress];
          if (c) {
            // we calling a component! time to trick the EVM
            console.log("Call to component " + c.id);
            // find the selector
            let inputData = Buffer.alloc(0);
            if (inLength !== BigInt(0)) {
              inputData = memory.read(Number(inOffset), Number(inLength));
            }
            const knownSelectors = getKnownSelectorsForComponentWithSchema(addressToSchema[toAddress]);
            const selector = knownSelectors[bytes4(bufferToHex(inputData))];
            if (selector) {
              console.log("Selector: " + selector);
              console.log("We can trick the EVM!");
              console.log(data.pc);
              pcPostcondition = data.pc + 1;
              addressPostcondition = addressToString(data.address);
              // Compute the output
              const calldata = "0x" + bufferToHex(inputData).slice(2 + 2 * 4);
              const output = readFromState(c, selector, calldata, addressToSchema[toAddress]);
              console.log("We return " + output);
              const returnData = bufferFromHex(output);
              // Write the return data
              const memOffset = Number(outOffset);
              let dataLength = Number(outLength);
              console.log(dataLength, returnData.length);
              if (BigInt(returnData.length) < dataLength) {
                dataLength = returnData.length;
              }
              const outData = getDataSlice(returnData, BigInt(0), BigInt(dataLength));
              console.log("outdata " + bufferToHex(outData));
              console.log("data length " + dataLength);
              // MUTATION TO STATE
              // pop the stack for real
              // make this call the empty address with no input nor output expected
              // // TODO: will probably need to add a no-op contract that just returns
              stack.popN(2);
              stack.push(BigInt(0));
              stack.push(BigInt(0));
              // write the output to memory
              postCondition = (s: Stack, m: Memory) => {
                console.log("executing postcondition");
                m.extend(memOffset, dataLength);
                m.write(memOffset, dataLength, outData);
                // pop the previous call
                s.pop();
                // Add a BigInt(1) to mark it as success
                s.push(BigInt(1));
              };
              preReturn = (s: Stack, m: Memory) => {
                console.log("executing prereturn");
                m.extend(0, returnData.length);
                m.write(0, returnData.length, returnData);
                s.popN(2);
                s.push(BigInt(returnData.length));
                s.push(BigInt(0));
              };
            } else {
              console.warn("Unknown selector on a STATICALL with a Component: " + bytes4(bufferToHex(inputData)));
            }
          }
        } else {
          const [_currentGasLimit, toAddr, value, inOffset, inLength, outOffset, outLength] = stack.peek(6);
          const toAddress = new Address(addressToBuffer(toAddr));
          const c = addressToComponent[addressToString(toAddress)];
          if (c) {
            console.log("MUTATING Call to component " + c.id + " addr: " + addressToString(toAddress));
            // we calling a component! time to trick the EVM
          }
        }
      }
      if (data.opcode.name === "RETURN" && preReturn) {
        hashData(data);
        preReturn(stack, memory);
        preReturn = undefined;
        hashData(data);
        const [offset, length] = stack.peek(2);
        console.log(offset, length);
        let returnData = Buffer.alloc(0);
        if (length !== BigInt(0)) {
          returnData = memory.read(Number(offset), Number(length));
        }
        console.log("Return: " + bufferToHex(returnData));
      }
    });

    // we can simplify this further by running an emv.runCall, no need to execute an entire tx!
    console.log("[SIMULATE] simulate a call to " + addressToString(tx.to!));
    console.log(vm._common.isActivatedEIP(3540));
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
