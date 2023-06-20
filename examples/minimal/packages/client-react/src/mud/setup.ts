import { Hex, createPublicClient, http } from "viem";
import { setupViemNetwork } from "./setupViemNetwork";
import { getNetworkConfig } from "./getNetworkConfig";

export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup() {
  const { chain, worldAddress } = await getNetworkConfig();
  console.log("viem chain", chain);

  const publicClient = createPublicClient({
    chain,
    // TODO: use fallback with websocket first once encoding issues are fixed
    //       https://github.com/wagmi-dev/viem/issues/725
    // transport: fallback([webSocket(), http()]),
    transport: http(),
    // TODO: do this per chain? maybe in the MUDChain config?
    pollingInterval: 1000,
  });

  const { storeCache } = await setupViemNetwork(publicClient, worldAddress as Hex);

  storeCache.tables.Inventory.subscribe((updates) => {
    console.log("inventory updates", updates);
  });

  return {
    worldAddress,
    publicClient,
    storeCache,
  };
}
