import { Provider } from "@ethersproject/providers";
import { Component, EntityIndex, getComponentEntities, getComponentValue, Type, World } from "@latticexyz/recs";
import { keccak256 } from "@latticexyz/utils";
import { Contract, ContractInterface, Signer } from "ethers";
import { observable, runInAction } from "mobx";
import { createTxQueue } from "./createTxQueue";
import { Network } from "./types";

export function createSystemExecutor<T extends { [key: string]: Contract }>(
  world: World,
  network: Network,
  systems: Component<{ value: Type.String }>,
  interfaces: { [key in keyof T]: ContractInterface }
) {
  const systemContracts = observable.box({} as T);
  const systemIdPreimages: { [key: string]: string } = Object.keys(interfaces).reduce((acc, curr) => {
    return { ...acc, [keccak256(curr)]: curr };
  }, {});

  // Initialize systems
  const initialContracts = {} as T;
  for (const systemEntity of getComponentEntities(systems)) {
    const { systemId, systemContract } = createSystemContract(systemEntity, network.signer.get());
    initialContracts[systemId as keyof T] = systemContract as T[keyof T];
  }
  runInAction(() => systemContracts.set(initialContracts));

  // Keep up to date
  systems.update$.subscribe((update) => {
    if (!update.value[0]) return console.warn("System id removed unexpectedly", world.entities[update.entity]);
    const { systemId, systemContract } = createSystemContract(update.entity, network.signer.get());
    console.log("System update", update);
    runInAction(() => systemContracts.set({ ...systemContracts.get(), [systemId]: systemContract }));
  });

  const { txQueue, dispose } = createTxQueue<T>(systemContracts, network);
  world.registerDisposer(dispose);

  return txQueue;

  function createSystemContract<C extends Contract>(
    entity: EntityIndex,
    signerOrProvider?: Signer | Provider
  ): { systemId: string; systemContract: C } {
    const { value: hashedSystemId } = getComponentValue(systems, entity) || {};
    if (!hashedSystemId) throw new Error("System entity not found");
    const systemId = systemIdPreimages[hashedSystemId];
    return {
      systemId,
      systemContract: new Contract(world.entities[entity], interfaces[systemId], signerOrProvider) as C,
    };
  }
}
