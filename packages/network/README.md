# Network

This package includes general low level utilities to interact with Ethereum contracts, as well as specialized MUD contract/client sync utilities.

The general utilities can be used without MUD. For the specialized but much more powerful utilities, usage of `solecs` is required and `recs` is recommended.

See [mud.dev/network](https://mud.dev/network) for the detailed API documentation.

# Example

This is a real-world example from an upcoming game built with MUD.

```typescript
// setupContracts.ts

import {
  createNetwork,
  createContracts,
  Mappings,
  createTxQueue,
  createSyncWorker,
  createEncoder,
  NetworkComponentUpdate,
  createSystemExecutor,
} from "@latticexyz/network";

import { Component as SolecsComponent, World as WorldContract } from "@latticexyz/solecs";
import WorldAbi from "@latticexyz/solecs/abi/World.sol/World.abi.json";
import ComponentAbi from "@latticexyz/solecs/abi/Component.sol/Component.json";

import {
  Component,
  Components,
  EntityIndex,
  getComponentEntities,
  getComponentValueStrict,
  removeComponent,
  Schema,
  setComponent,
  Type,
  World,
} from "@latticexyz/recs";

import { keccak256, stretch, toEthAddress } from "@latticexyz/utils";

import { defineStringComponent } from "@latticexyz/std-client";

import { bufferTime, filter, Observable, Subject } from "rxjs";
import { computed, IComputedValue } from "mobx";
import { Contract, ethers, Signer, Wallet } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

import { SystemTypes } from "<contracts>/types/SystemTypes";
import { SystemAbis } from "<contracts>/types/SystemAbis.mjs";
import { config } from "./config";

export type ContractComponents = {
  [key: string]: Component<Schema, { contractId: string }>;
};

export async function setupContracts<C extends ContractComponents>(world: World, components: C) {
  const SystemsRegistry = defineStringComponent(world, {
    id: "SystemsRegistry",
    metadata: { contractId: "world.component.systems" },
  });

  const ComponentsRegistry = defineStringComponent(world, {
    id: "ComponentsRegistry",
    metadata: { contractId: "world.component.components" },
  });

  components = {
    ...components,
    SystemsRegistry,
    ComponentsRegistry,
  };

  const mappings: Mappings<C> = {};

  for (const key of Object.keys(components)) {
    const { contractId } = components[key].metadata;
    mappings[keccak256(contractId)] = key;
  }

  const network = await createNetwork(config);

  const signerOrProvider = computed(() => network.signer.get() || network.providers.get().json);

  const { contracts, config: contractsConfig } = await createContracts<{ World: WorldContract }>({
    config: { World: { abi: WorldAbi, address: config.worldAddress } },
    signerOrProvider,
  });

  const { txQueue, dispose: disposeTxQueue } = createTxQueue(contracts, network);

  const systems = createSystemExecutor<SystemTypes>(world, network, SystemsRegistry, SystemAbis, {
    devMode: config.devMode,
  });

  const { ecsEvent$, config$, dispose } = createSyncWorker<C>();

  function startSync() {
    config$.next({
      provider: networkConfig.provider,
      worldContract: contractsConfig.World,
      initialBlockNumber: config.initialBlockNumber ?? 0,
      chainId: config.chainId,
      disableCache: false,
      snapshotServiceUrl: networkConfig.snapshotServiceUrl,
      streamServiceUrl: networkConfig.streamServiceUrl,
    });
  }

  const { txReduced$ } = applyNetworkUpdates(world, components, ecsEvent$, mappings);

  const encoders = createEncoders(world, ComponentsRegistry, signerOrProvider);

  return { txQueue, txReduced$, encoders, network, startSync, systems };
}

async function createEncoders(
  world: World,
  components: Component<{ value: Type.String }>,
  signerOrProvider: IComputedValue<JsonRpcProvider | Signer>
) {
  const encoders = {} as Record<string, ReturnType<typeof createEncoder>>;

  async function fetchAndCreateEncoder(entity: EntityIndex) {
    const componentAddress = toEthAddress(world.entities[entity]);
    const componentId = getComponentValueStrict(components, entity).value;
    const componentContract = new Contract(
      componentAddress,
      ComponentAbi.abi,
      signerOrProvider.get()
    ) as SolecsComponent;
    const [componentSchemaPropNames, componentSchemaTypes] = await componentContract.getSchema();
    encoders[componentId] = createEncoder(componentSchemaPropNames, componentSchemaTypes);
  }

  // Initial setup
  for (const entity of getComponentEntities(components)) fetchAndCreateEncoder(entity);

  // Keep up to date
  const subscription = components.update$.subscribe((update) => fetchAndCreateEncoder(update.entity));
  world.registerDisposer(() => subscription?.unsubscribe());

  return encoders;
}

/**
 * Sets up synchronization between contract components and client components
 */
function applyNetworkUpdates<C extends Components>(
  world: World,
  components: C,
  ecsEvent$: Observable<NetworkComponentUpdate<C>>,
  mappings: Mappings<C>
) {
  const txReduced$ = new Subject<string>();

  const ecsEventSub = ecsEvent$.subscribe((update) => {
    const entityIndex = world.entityToIndex.get(update.entity) ?? world.registerEntity({ id: update.entity });
    const componentKey = mappings[update.component];

    if (update.value === undefined) {
      // undefined value means component removed
      removeComponent(components[componentKey] as Component<Schema>, entityIndex);
    } else {
      setComponent(components[componentKey] as Component<Schema>, entityIndex, update.value);
    }

    if (update.lastEventInTx) txReduced$.next(update.txHash);
  });

  return { txReduced$: txReduced$.asObservable() };
}
```
