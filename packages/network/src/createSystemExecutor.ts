import { Provider } from "@ethersproject/providers";
import { Component, EntityIndex, getComponentEntities, getComponentValue, Type, World } from "@latticexyz/recs";
import { keccak256, toEthAddress } from "@latticexyz/utils";
import { Contract, ContractInterface, Signer } from "ethers";
import { observable, runInAction } from "mobx";
import { createTxQueue } from "./createTxQueue";
import { Network } from "./createNetwork";
import { BehaviorSubject } from "rxjs";
import { TxQueue } from "./types";

/**
 * Create a system executor object.
 * The system executor object is an object indexed by available system ids (given in the interfaces object)
 * with {@link createTxQueue tx-queue enabled system contracts} as value.
 *
 * @param world Recs World object.
 * @param network Network ({@link createNetwork}).
 * @param systems Recs registry component containing the mapping from system address to system id.
 * @param interfaces Interfaces of the systems to create.
 * @param options
 * @returns Systems object to call system contracts.
 */
export function createSystemExecutor<T extends { [key: string]: Contract }>(
  world: World,
  network: Network,
  systems: Component<{ value: Type.String }>,
  interfaces: { [key in keyof T]: ContractInterface },
  gasPrice$: BehaviorSubject<number>,
  options?: { devMode?: boolean; concurrency?: number }
) {
  const systemContracts = observable.box({} as T);
  const systemIdPreimages: { [key: string]: string } = Object.keys(interfaces).reduce((acc, curr) => {
    return { ...acc, [keccak256(curr)]: curr };
  }, {});

  // Initialize systems
  const initialContracts = {} as T;
  for (const systemEntity of getComponentEntities(systems)) {
    const system = createSystemContract(systemEntity, network.signer.get());
    if (!system) continue;
    if (system.id) initialContracts[system.id as keyof T] = system.contract as T[keyof T];
    initialContracts[system.hashedId as keyof T] = system.contract as T[keyof T];
  }
  runInAction(() => systemContracts.set(initialContracts));

  // Keep up to date
  systems.update$.subscribe((update) => {
    if (!update.value[0]) return;
    const system = createSystemContract(update.entity, network.signer.get());
    if (!system) return;
    runInAction(() => {
      if (system.id) systemContracts.set({ ...systemContracts.get(), [system.id]: system.contract });
      systemContracts.set({ ...systemContracts.get(), [system.hashedId]: system.contract });
    });
  });

  const { txQueue, dispose } = createTxQueue<T>(systemContracts, network, gasPrice$, options);
  world.registerDisposer(dispose);

  return { systems: txQueue, untypedSystems: txQueue as TxQueue<{ [key: string]: Contract }> };

  function createSystemContract<C extends Contract>(
    entity: EntityIndex,
    signerOrProvider?: Signer | Provider
  ): { id: string | undefined; hashedId: string; contract: C } | undefined {
    const { value: hashedId } = getComponentValue(systems, entity) || {};
    if (!hashedId) throw new Error("System entity not found");
    const id = systemIdPreimages[hashedId];
    return {
      id,
      hashedId,
      contract: new Contract(toEthAddress(world.entities[entity]), interfaces[id], signerOrProvider) as C,
    };
  }
}
