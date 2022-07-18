import { Provider } from "@ethersproject/providers";
import { Component, EntityIndex, getComponentEntities, getComponentValue, Type, World } from "@latticexyz/recs";
import { keccak256, toEthAddress } from "@latticexyz/utils";
import { Contract, ContractInterface, Signer } from "ethers";
import { observable, runInAction } from "mobx";
import { createTxQueue } from "./createTxQueue";
import { Network } from "./createNetwork";
import { createLocalEVM } from "./createLocalEVM";

export async function createSystemExecutor<T extends { [key: string]: Contract }>(
  world: World,
  network: Network,
  systems: Component<{ value: Type.String }>,
  interfaces: { [key in keyof T]: ContractInterface },
  options?: { devMode?: boolean }
) {
  const systemContracts = observable.box({} as T);
  const systemIdPreimages: { [key: string]: string } = Object.keys(interfaces).reduce((acc, curr) => {
    return { ...acc, [keccak256(curr)]: curr };
  }, {});

  // Initialize systems
  const initialContracts = {} as T;
  for (const systemEntity of getComponentEntities(systems)) {
    const system = await createSystemContract(systemEntity, network.signer.get());
    if (!system) continue;
    const { contract, id, bytecode } = system;
    const typedContract = contract as T[keyof T];
    initialContracts[id as keyof T] = { ...typedContract, bytecode };
  }
  runInAction(() => systemContracts.set(initialContracts));

  // Keep up to date
  systems.update$.subscribe(async (update) => {
    if (!update.value[0]) return;
    const system = await createSystemContract(update.entity, network.signer.get());
    if (!system) return;
    const { contract, id, bytecode } = system;
    runInAction(() => systemContracts.set({ ...systemContracts.get(), [id]: { ...contract, bytecode } }));
  });

  const { txQueue, dispose: disposeTxQueue } = createTxQueue<T>(systemContracts, network, options);
  const { localEVM, dispose: disposeLocalEVM } = createLocalEVM<T>(systemContracts, network, options);
  world.registerDisposer(disposeTxQueue);
  world.registerDisposer(disposeLocalEVM);

  return { systems: txQueue, localEVM };

  async function createSystemContract<C extends Contract>(
    entity: EntityIndex,
    signerOrProvider?: Signer | Provider
  ): Promise<{ id: string; contract: C; bytecode: string } | undefined> {
    const { value: hashedSystemId } = getComponentValue(systems, entity) || {};
    if (!hashedSystemId) throw new Error("System entity not found");
    const id = systemIdPreimages[hashedSystemId];
    const address = toEthAddress(world.entities[entity]);
    if (!id) {
      console.warn("Unknown system:", hashedSystemId);
      return;
    }
    let bytecode;
    if (Provider.isProvider(signerOrProvider)) {
      const provider = signerOrProvider as Provider;
      bytecode = await provider.getCode(address);
    } else {
      const signer = signerOrProvider as Signer;
      const provider = signer.provider!;
      bytecode = await provider.getCode(address);
    }
    return {
      id,
      bytecode,
      contract: new Contract(toEthAddress(world.entities[entity]), interfaces[id], signerOrProvider) as C,
    };
  }
}
