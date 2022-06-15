// import {
//   createNetwork,
//   createContracts,
//   createSigner,
//   createTopics,
//   createContractsEventStream,
//   createTxQueue,
//   Mappings,
//   ContractEvent,
// } from "@latticexyz/network";
// import { DEV_PRIVATE_KEY, DIAMOND_ADDRESS, RPC_URL, RPC_WS_URL } from "../constants.local";
// import { World as WorldContract } from "ri-contracts/types/ethers-contracts/World";
// import { CombinedFacets } from "ri-contracts/types/ethers-contracts/CombinedFacets";
// import WorldABI from "ri-contracts/abi/World.json";
// import EmberABI from "ri-contracts/abi/CombinedFacets.json";
// import { combineLatest, from, map, mergeMap, ReplaySubject, Subscription } from "rxjs";
// import { World } from "@latticexyz/recs";
// import { NetworkLayer } from "../types";
// import { setupMappings } from "./setupMappings";
// import { JsonRpcProvider } from "@ethersproject/providers";
// import { Signer } from "ethers";
// import { filterNullish } from "@latticexyz/utils";

// export function setupContracts(
//   world: World,
//   components: NetworkLayer["components"],
//   mappings: Mappings<NetworkLayer["components"]>,
//   options?: {
//     skip?: boolean;
//   }
// ) {
//   const connected$ = new ReplaySubject<boolean>(1);
//   const contracts$ = new ReplaySubject<{ Ember: CombinedFacets; World: WorldContract }>(1);
//   const ethersSigner$ = new ReplaySubject<Signer>(1);
//   const provider$ = new ReplaySubject<JsonRpcProvider>(1);
//   const contractEvents$ = new ReplaySubject<ContractEvent<{ World: WorldContract }>>();

//   let connectedSub: Subscription | undefined = undefined;
//   let signerSub: Subscription | undefined = undefined;
//   let contractsSub: Subscription | undefined = undefined;
//   let contractEventsSub: Subscription | undefined = undefined;
//   let providerSub: Subscription | undefined = undefined;

//   // Setup mappings
//   const { txReduced$ } = setupMappings(world, components, contracts$, contractEvents$, mappings);

//   const { txQueue, dispose: disposeTxQueue } = createTxQueue(contracts$, ethersSigner$, provider$, connected$);
//   world.registerDisposer(disposeTxQueue);

//   if (!options?.skip) connect();

//   return { txQueue, connect, txReduced$ };

//   /**
//    * Logic to connect the subjects to the network.
//    */
//   function connect() {
//     try {
//       const network = createNetwork({
//         clock: {
//           period: 5000,
//           initialTime: 0,
//         },
//         provider: {
//           jsonRpcUrl: RPC_URL,
//           wsRpcUrl: RPC_WS_URL,
//           options: {
//             batch: false,
//           },
//         },
//         chainId: 1337,
//       });
//       world.registerDisposer(network.dispose);

//       // Connect the connected stream to the outer scope connected stream
//       connectedSub?.unsubscribe();
//       connectedSub = network.connected$.subscribe(connected$);

//       // Connect the signer to the outer scope signer
//       signerSub?.unsubscribe();
//       const _signer = createSigner({ privateKey: DEV_PRIVATE_KEY }, network.providers$);
//       signerSub = _signer.ethersSigner$.subscribe(ethersSigner$);

//       // Connect the provider to the outer scope provider
//       providerSub?.unsubscribe();
//       const _provider = network.providers$.pipe(map(([json]) => json));
//       providerSub = _provider.pipe(filterNullish()).subscribe(provider$);

//       const rpcSupportsBatchQueries$ = network.config$.pipe(map((c) => c.rpcSupportsBatchQueries));

//       const emberContract = createContracts<{ Ember: CombinedFacets }>(
//         { Ember: { abi: EmberABI.abi, address: DIAMOND_ADDRESS } },
//         _signer.ethersSigner$
//       );

//       const worldContract$ = emberContract.contracts$.pipe(
//         mergeMap(({ Ember }) => from(Ember.world())), // Get the world address
//         mergeMap(
//           (address) =>
//             createContracts<{ World: WorldContract }>({ World: { abi: WorldABI.abi, address } }, _signer.ethersSigner$)
//               .contracts$
//         )
//       );

//       // Connect the contract stream to the outer scope contracts
//       contractsSub?.unsubscribe();
//       const _contracts = combineLatest([emberContract.contracts$, worldContract$]).pipe(
//         map(([{ Ember }, { World }]) => ({
//           Ember,
//           World,
//         }))
//       );
//       contractsSub = _contracts.subscribe(contracts$);

//       const { contractTopics } = createTopics<{ World: WorldContract }>({
//         World: {
//           abi: WorldABI.abi,
//           topics: ["ComponentValueSet", "ComponentValueRemoved"],
//         },
//       });

//       // Connect the contract events stream to the outer scope contracts
//       contractEventsSub?.unsubscribe();
//       const contractEventStream = createContractsEventStream(
//         {
//           contractTopics,
//           initialBlockNumber: 0,
//         },
//         worldContract$,
//         network.blockNumber$,
//         provider$,
//         rpcSupportsBatchQueries$
//       );
//       contractEventsSub = contractEventStream.eventStream$.subscribe(contractEvents$);
//     } catch (e) {
//       console.warn(e);
//     }
//   }
// }
