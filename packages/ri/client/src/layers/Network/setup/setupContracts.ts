import {
  createNetwork,
  createContracts,
  createSigner,
  createTopics,
  createContractsEventStream,
  createTxQueue,
  Mappings,
  ContractEvent,
} from "@mud/network";
import { RPC_URL, DEV_PRIVATE_KEY, DIAMOND_ADDRESS } from "../constants";
import { World as WorldContract } from "ri-contracts/types/ethers-contracts/World";
import { EmberFacet } from "ri-contracts/types/ethers-contracts/EmberFacet";
import WorldABI from "ri-contracts/abi/World.json";
import EmberABI from "ri-contracts/abi/EmberFacet.json";
import { combineLatest, from, map, mergeMap, ReplaySubject, Subscription } from "rxjs";
import { World } from "@mud/recs";
import { NetworkLayer } from "../types";
import { setupMappings } from "./setupMappings";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Signer } from "ethers";

export function setupContracts(
  world: World,
  components: NetworkLayer["components"],
  mappings: Mappings<NetworkLayer["components"]>,
  options?: {
    skip?: boolean;
  }
) {
  const connected$ = new ReplaySubject<boolean>(1);
  const contracts$ = new ReplaySubject<{ Ember: EmberFacet; World: WorldContract }>(1);
  const ethersSigner$ = new ReplaySubject<Signer>(1);
  const provider$ = new ReplaySubject<JsonRpcProvider>(1);
  const contractEvents$ = new ReplaySubject<ContractEvent<{ World: WorldContract }>>();

  let connectedSub: Subscription | undefined = undefined;
  let signerSub: Subscription | undefined = undefined;
  let contractsSub: Subscription | undefined = undefined;
  let contractEventsSub: Subscription | undefined = undefined;
  let providerSub: Subscription | undefined = undefined;

  // Setup mappings
  const { txReduced$ } = setupMappings(world, components, contracts$, contractEvents$, mappings);

  const { txQueue, dispose: disposeTxQueue } = createTxQueue(contracts$, ethersSigner$, provider$, connected$);
  world.registerDisposer(disposeTxQueue);

  if (!options?.skip) connect();

  return { txQueue, connect, txReduced$ };

  /**
   * Logic to connect the subjects to the network.
   */
  function connect() {
    try {
      const network = createNetwork({
        time: {
          period: 5000,
        },
        chainId: 1337,
        rpcSupportsBatchQueries: false,
        rpcUrl: RPC_URL,
        // rpcWsUrl: RPC_URL,
      });
      world.registerDisposer(network.dispose);

      // Connect the connected stream to the outer scope connected stream
      connectedSub?.unsubscribe();
      connectedSub = network.connected$.subscribe(connected$);

      // Connect the signer to the outer scope signer
      signerSub?.unsubscribe();
      const _signer = createSigner({ privateKey: DEV_PRIVATE_KEY }, network.providers$);
      signerSub = _signer.ethersSigner$.subscribe(ethersSigner$);

      // Connect the provider to the outer scope provider
      providerSub?.unsubscribe();
      const _provider = network.providers$.pipe(map(([json]) => json));
      providerSub = _provider.subscribe(provider$);

      const rpcSupportsBatchQueries$ = network.config$.pipe(map((c) => c.rpcSupportsBatchQueries));

      const emberContract = createContracts<{ Ember: EmberFacet }>(
        { Ember: { abi: EmberABI.abi, address: DIAMOND_ADDRESS } },
        _signer.ethersSigner$
      );

      const worldContract$ = emberContract.contracts$.pipe(
        mergeMap(({ Ember }) => from(Ember.world())), // Get the world address
        mergeMap(
          (address) =>
            createContracts<{ World: WorldContract }>({ World: { abi: WorldABI.abi, address } }, _signer.ethersSigner$)
              .contracts$
        )
      );

      // Connect the contract stream to the outer scope contracts
      contractsSub?.unsubscribe();
      const _contracts = combineLatest([emberContract.contracts$, worldContract$]).pipe(
        map(([{ Ember }, { World }]) => ({
          Ember,
          World,
        }))
      );
      contractsSub = _contracts.subscribe(contracts$);

      const { contractTopics } = createTopics<{ World: WorldContract }>({
        World: {
          abi: WorldABI.abi,
          topics: ["ComponentValueSet", "ComponentValueRemoved"],
        },
      });

      // Connect the contract events stream to the outer scope contracts
      contractEventsSub?.unsubscribe();
      const contractEventStream = createContractsEventStream(
        {
          contractTopics,
          initialBlockNumber: 0,
        },
        worldContract$,
        network.blockNumber$,
        _provider,
        rpcSupportsBatchQueries$
      );
      contractEventsSub = contractEventStream.eventStream$.subscribe(contractEvents$);
    } catch (e) {
      console.warn(e);
    }
  }
}
