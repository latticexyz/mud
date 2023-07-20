import { getBurnerWallet, setupMUDV2Network } from "@latticexyz/std-client";
import { createFastTxExecutor, createFaucetService, getSnapSyncRecords, SingletonID } from "@latticexyz/network";
import { getNetworkConfig } from "./getNetworkConfig";
import { defineContractComponents } from "./contractComponents";
import { world } from "./world";
import { Contract, Signer, utils } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { IWorld__factory } from "contracts/types/ethers-contracts/factories/IWorld__factory";
import { getTableIds } from "@latticexyz/utils";
import storeConfig from "contracts/mud.config";
import { createPublicClient, fallback, webSocket, http, createWalletClient, getContract, Hex } from "viem";
import {
  blockRangeToLogs,
  createBlockStream,
  groupLogsByBlockNumber,
  isNonPendingBlock,
} from "@latticexyz/block-logs-stream";
import { filter, map, tap, mergeMap, from, concatMap } from "rxjs";
import { storeEventsAbi } from "@latticexyz/store";
import { blockLogsToRecs } from "@latticexyz/store-sync/recs";
import { privateKeyToAccount } from "viem/accounts";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  const contractComponents = defineContractComponents(world);
  const networkConfig = await getNetworkConfig();

  const publicClient = createPublicClient({
    chain: networkConfig.chain,
    transport: fallback([webSocket(), http()]),
    pollingInterval: 1000,
  });

  const latestBlock$ = createBlockStream({ publicClient, blockTag: "latest" });

  const latestBlockNumber$ = latestBlock$.pipe(
    filter(isNonPendingBlock),
    map((block) => block.number)
  );

  const blockLogs$ = latestBlockNumber$.pipe(
    tap((latestBlockNumber) => console.log("latest block number", latestBlockNumber)),
    map((latestBlockNumber) => ({ startBlock: 0n, endBlock: latestBlockNumber })),
    blockRangeToLogs({
      publicClient,
      events: storeEventsAbi,
    }),
    mergeMap(({ toBlock, logs }) => from(groupLogsByBlockNumber(logs, toBlock)))
  );

  blockLogs$
    .pipe(
      concatMap(blockLogsToRecs({ recsComponents: contractComponents, config: storeConfig })),
      tap(({ blockNumber, operations }) => {
        console.log("stored", operations.length, "operations for block", blockNumber);
      })
    )
    .subscribe();

  const singletonEntity = world.registerEntity({ id: "entity:" });

  const burnerAccount = privateKeyToAccount(getBurnerWallet().value);
  const burnerWalletClient = createWalletClient({
    account: burnerAccount,
    chain: networkConfig.chain,
    transport: fallback([webSocket(), http()]),
    // TODO: configure polling per chain? maybe in the MUDChain config?
    pollingInterval: 1000,
  });

  return {
    components: contractComponents,
    singletonEntity,
    publicClient,
    walletClient: burnerWalletClient,
    world: getContract({
      address: networkConfig.worldAddress as Hex,
      abi: IWorld__factory.abi,
      publicClient,
      walletClient: burnerWalletClient,
    }),
  };
}
