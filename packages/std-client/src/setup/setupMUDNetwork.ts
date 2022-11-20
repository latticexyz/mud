import {
  createNetwork,
  createContracts,
  Mappings,
  createTxQueue,
  createSyncWorker,
  createSystemExecutor,
  Ack,
  InputType,
} from "@latticexyz/network";
import { BehaviorSubject, concatMap, from, Subject } from "rxjs";
import { World } from "@latticexyz/recs";
import { computed } from "mobx";
import { keccak256 } from "@latticexyz/utils";
import { Contract, ContractInterface } from "ethers";
import { World as WorldContract } from "@latticexyz/solecs/types/ethers-contracts/World";
import { abi as WorldAbi } from "@latticexyz/solecs/abi/World.json";
import { defineStringComponent } from "../components";
import { keys } from "lodash";
import { ContractComponent, ContractComponents, NetworkComponents, SetupContractConfig } from "./types";
import {
  applyNetworkUpdates,
  createDecodeNetworkComponentUpdate,
  createEncoders,
  createSystemCallStreams,
} from "./utils";

export async function setupMUDNetwork<C extends ContractComponents, SystemTypes extends { [key: string]: Contract }>(
  networkConfig: SetupContractConfig,
  world: World,
  components: C,
  SystemAbis: { [key in keyof SystemTypes]: ContractInterface },
  options?: { initialGasPrice?: number; fetchSystemCalls?: boolean }
) {
  const SystemsRegistry = defineStringComponent(world, {
    id: "SystemsRegistry",
    metadata: { contractId: "world.component.systems" },
  });

  const ComponentsRegistry = defineStringComponent(world, {
    id: "ComponentsRegistry",
    metadata: { contractId: "world.component.components" },
  });

  (components as NetworkComponents<C>).SystemsRegistry = SystemsRegistry;
  (components as NetworkComponents<C>).ComponentsRegistry = ComponentsRegistry;

  // Mapping from component contract id to key in components object
  const mappings: Mappings<C> = {};

  // Function to register new components in mappings object
  function registerComponent(key: string, component: ContractComponent) {
    const { contractId } = component.metadata;
    mappings[keccak256(contractId)] = key;
  }

  // Register initial components in mappings object
  for (const key of Object.keys(components)) {
    registerComponent(key, components[key]);
  }

  const network = await createNetwork(networkConfig);
  world.registerDisposer(network.dispose);

  const signerOrProvider = computed(() => network.signer.get() || network.providers.get().json);

  const { contracts, config: contractsConfig } = await createContracts<{ World: WorldContract }>({
    config: { World: { abi: WorldAbi, address: networkConfig.worldAddress } },
    signerOrProvider,
  });

  const gasPriceInput$ = new BehaviorSubject<number>(
    // If no initial gas price is provided, check the gas price once and add a 30% buffer
    options?.initialGasPrice || Math.ceil((await signerOrProvider.get().getGasPrice()).toNumber() * 1.3)
  );

  const { txQueue, dispose: disposeTxQueue } = createTxQueue(contracts, network, gasPriceInput$, {
    devMode: networkConfig.devMode,
  });
  world.registerDisposer(disposeTxQueue);

  const { systems, registerSystem, getSystemContract } = createSystemExecutor<SystemTypes>(
    world,
    network,
    SystemsRegistry,
    SystemAbis,
    gasPriceInput$,
    {
      devMode: networkConfig.devMode,
    }
  );

  const decodeNetworkComponentUpdate = createDecodeNetworkComponentUpdate(world, components, mappings);
  const { systemCallStreams, decodeAndEmitSystemCall } = createSystemCallStreams(
    world,
    keys(SystemAbis),
    SystemsRegistry,
    getSystemContract,
    decodeNetworkComponentUpdate
  );

  // Create sync worker
  const ack$ = new Subject<Ack>();
  // Avoid passing externalProvider to sync worker (too complex to copy)
  const {
    provider: { externalProvider: _, ...providerConfig },
    ...syncWorkerConfig
  } = networkConfig;
  const { ecsEvents$, input$, dispose } = createSyncWorker<C>(ack$);
  world.registerDisposer(dispose);
  function startSync() {
    input$.next({
      type: InputType.Config,
      data: {
        ...syncWorkerConfig,
        provider: providerConfig,
        worldContract: contractsConfig.World,
        initialBlockNumber: networkConfig.initialBlockNumber ?? 0,
        disableCache: networkConfig.devMode, // Disable cache on local networks (hardhat / anvil)
        fetchSystemCalls: options?.fetchSystemCalls,
      },
    });
  }

  const { txReduced$ } = applyNetworkUpdates(world, components, ecsEvents$, mappings, ack$, decodeAndEmitSystemCall);

  const encoders = networkConfig.encoders
    ? createEncoders(world, ComponentsRegistry, signerOrProvider)
    : new Promise((resolve) => resolve({}));

  return {
    txQueue,
    txReduced$,
    encoders,
    network,
    startSync,
    systems,
    systemCallStreams,
    gasPriceInput$,
    ecsEvent$: ecsEvents$.pipe(concatMap((updates) => from(updates))),
    mappings,
    registerComponent,
    registerSystem,
  };
}
