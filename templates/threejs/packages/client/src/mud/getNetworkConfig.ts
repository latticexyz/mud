import { SetupContractConfig, getBurnerWallet } from "@latticexyz/std-client";
import worldsJson from "contracts/worlds.json";
import { supportedChains } from "./supportedChains";

const worlds = worldsJson as Partial<Record<string, { address: string; blockNumber?: number }>>;

type NetworkConfig = SetupContractConfig & {
  privateKey: string;
  faucetServiceUrl?: string;
  snapSync?: boolean;
};

export async function getNetworkConfig(): Promise<NetworkConfig> {
  const params = new URLSearchParams(window.location.search);

  const chainId = Number(params.get("chainId") || import.meta.env.VITE_CHAIN_ID || 31337);
  const chainIndex = supportedChains.findIndex((c) => c.id === chainId);
  const chain = supportedChains[chainIndex];
  if (!chain) {
    throw new Error(`Chain ${chainId} not found`);
  }

  const world = worlds[chain.id.toString()];
  const worldAddress = params.get("worldAddress") || world?.address;
  if (!worldAddress) {
    throw new Error(`No world address found for chain ${chainId}. Did you run \`mud deploy\`?`);
  }

  const initialBlockNumber = params.has("initialBlockNumber")
    ? Number(params.get("initialBlockNumber"))
    : world?.blockNumber ?? -1; // -1 will attempt to find the block number from RPC

  return {
    clock: {
      period: 1000,
      initialTime: 0,
      syncInterval: 5000,
    },
    provider: {
      chainId,
      jsonRpcUrl: params.get("rpc") ?? chain.rpcUrls.default.http[0],
      wsRpcUrl: params.get("wsRpc") ?? chain.rpcUrls.default.webSocket?.[0],
    },
    privateKey: getBurnerWallet().value,
    chainId,
    modeUrl: params.get("mode") ?? chain.modeUrl,
    faucetServiceUrl: params.get("faucet") ?? chain.faucetUrl,
    worldAddress,
    initialBlockNumber,
    snapSync: params.get("snapSync") === "true",
    disableCache: params.get("cache") === "false",
  };
}
