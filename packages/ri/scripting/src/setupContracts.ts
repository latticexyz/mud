import { createNetwork, createContracts, createSigner, createTxQueue } from "@mudkit/network";
import { DEV_PRIVATE_KEY, DIAMOND_ADDRESS, RPC_URL, RPC_WS_URL } from "./constants";
import { World as WorldContract } from "ri-contracts/types/ethers-contracts/World";
import { CombinedFacets } from "ri-contracts/types/ethers-contracts/CombinedFacets";
import WorldABI from "ri-contracts/abi/World.json";
import EmberABI from "ri-contracts/abi/CombinedFacets.json";
import { combineLatest, from, map, mergeMap, ReplaySubject } from "rxjs";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Signer } from "ethers";
import { awaitValue, filterNullish, streamToComputed } from "@mudkit/utils";

export async function setupContracts() {
  const connected$ = new ReplaySubject<boolean>(1);
  const contracts$ = new ReplaySubject<{ Ember: CombinedFacets; World: WorldContract }>(1);
  const ethersSigner$ = new ReplaySubject<Signer>(1);
  const provider$ = new ReplaySubject<JsonRpcProvider>(1);

  const { txQueue, ready } = createTxQueue(contracts$, ethersSigner$, provider$, connected$, {
    concurrency: Number.MAX_SAFE_INTEGER,
    ignoreConfirmation: true,
  });

  try {
    const network = createNetwork({
      time: {
        period: 5000,
      },
      chainId: 1337,
      rpcSupportsBatchQueries: false,
      rpcUrl: RPC_URL,
      rpcWsUrl: RPC_WS_URL,
    });

    // Connect the connected stream to the outer scope connected stream
    network.connected$.subscribe(connected$);

    // Connect the signer to the outer scope signer
    createSigner({ privateKey: DEV_PRIVATE_KEY }, network.providers$).ethersSigner$.subscribe(ethersSigner$);

    // Connect the provider to the outer scope provider
    network.providers$
      .pipe(map(([json, ws]) => ws))
      .pipe(filterNullish())
      .subscribe(provider$);

    // Create a stream of ember contracts
    const emberContract = createContracts<{ Ember: CombinedFacets }>(
      { Ember: { abi: EmberABI.abi, address: DIAMOND_ADDRESS } },
      ethersSigner$
    );

    // Create a stream of world contracts
    const worldContract$ = emberContract.contracts$.pipe(
      mergeMap(({ Ember }) => from(Ember.world())), // Get the world address
      mergeMap(
        (address) =>
          createContracts<{ World: WorldContract }>({ World: { abi: WorldABI.abi, address } }, ethersSigner$).contracts$
      )
    );

    // Connect the contract stream to the outer scope contracts
    combineLatest([emberContract.contracts$, worldContract$])
      .pipe(
        map(([{ Ember }, { World }]) => ({
          Ember,
          World,
        }))
      )
      .subscribe(contracts$);
  } catch (e) {
    console.warn(e);
  }

  await awaitValue(ready);
  return { txQueue, provider: streamToComputed(provider$), signer: streamToComputed(ethersSigner$) };
}
