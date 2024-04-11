/*
 * The MUD client code is built on top of viem
 * (https://viem.sh/docs/getting-started.html).
 * This line imports the functions we need from it.
 */
import { createPublicClient } from "viem";
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import { getNetworkConfig } from "./getNetworkConfig";
import { createViemClientConfig } from "./createViemClientConfig";

/*
 * Import our MUD config, which includes strong types for
 * our tables and other config options. We use this for `syncToZustand()`.
 *
 * See https://mud.dev/templates/typescript/contracts#mudconfigts
 * for the source of this information.
 */
import mudConfig from "contracts/mud.config";

export type Network = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  const networkConfig = await getNetworkConfig();

  /*
   * Create a viem public (read only) client
   * (https://viem.sh/docs/clients/public.html)
   */
  const publicClient = createPublicClient(createViemClientConfig(networkConfig.chain));

  /*
   * Sync on-chain state into Zustand and keeps our client in sync.
   * Uses the MUD indexer if available, otherwise falls back
   * to the viem publicClient to make RPC calls to fetch MUD
   * events from the chain.
   */
  const syncResult = await syncToZustand({
    config: mudConfig,
    address: networkConfig.worldAddress,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
  });

  return {
    publicClient,
    worldAddress: networkConfig.worldAddress,
    ...syncResult,
  };
}
