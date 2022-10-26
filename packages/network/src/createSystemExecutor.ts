import { Provider } from "@ethersproject/providers";
import { Component, EntityIndex, getComponentEntities, getComponentValue, Type, World } from "@latticexyz/recs";
import { keccak256, toEthAddress } from "@latticexyz/utils";
import { Contract, ContractInterface, Signer } from "ethers";
import { observable, runInAction } from "mobx";
import { createTxQueue } from "./createTxQueue";
import { Network } from "./createNetwork";
import { BehaviorSubject } from "rxjs";

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
    initialContracts[system.id as keyof T] = system.contract as T[keyof T];
  }
  runInAction(() => systemContracts.set(initialContracts));

  // Keep up to date
  systems.update$.subscribe((update) => {
    if (!update.value[0]) return;
    const system = createSystemContract(update.entity, network.signer.get());
    if (!system) return;
    runInAction(() => systemContracts.set({ ...systemContracts.get(), [system.id]: system.contract }));
  });

  const { txQueue, dispose } = createTxQueue<T>(systemContracts, network, gasPrice$, options);
  world.registerDisposer(dispose);

  return txQueue;

  function createSystemContract<C extends Contract>(
    entity: EntityIndex,
    signerOrProvider?: Signer | Provider
  ): { id: string; contract: C } | undefined {
    const { value: hashedSystemId } = getComponentValue(systems, entity) || {};
    if (!hashedSystemId) throw new Error("System entity not found");
    const id = systemIdPreimages[hashedSystemId];
    if (!id) {
      console.warn("Unknown system:", hashedSystemId);
      return;
    }
    return {
      id,
      contract: new Contract(toEthAddress(world.entities[entity]), interfaces[id], signerOrProvider) as C,
    };
  }
}
