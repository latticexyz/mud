import { SetupContractConfig, getBurnerWallet } from "@latticexyz/std-client";

import { Chain } from "@wagmi/chains";
import latticeTestnet from "./supportedChains/latticeTestnet";
import latestLatticeTestnetDeploy from "contracts/deploys/4242/latest.json";
import localhost from "./supportedChains/localhost";
import latestLocalhostDeploy from "contracts/deploys/31337/latest.json";

type NetworkConfig = SetupContractConfig & {
  privateKey: string;
  faucetServiceUrl?: string;
  chain: Chain;
};

export async function getNetworkConfig(): Promise<NetworkConfig> {
  const params = new URLSearchParams(window.location.search);

  const supportedChains = [localhost, latticeTestnet];
  const deploys = [latestLocalhostDeploy, latestLatticeTestnetDeploy];

  const chainId = Number(params.get("chainId") || import.meta.env.VITE_CHAIN_ID);
  const chainIndex = supportedChains.findIndex((c) => c.id === chainId);
  const chain = supportedChains[chainIndex];
  if (!chain) {
    throw new Error(`Chain ${chainId} not found`);
  }

  const deploy = deploys[chainIndex];
  if (!deploy) {
    throw new Error(`No deployment found for chain ${chainId}. Did you run \`mud deploy\`?`);
  }

  const worldAddress = params.get("worldAddress") || deploy.worldAddress;
  if (!worldAddress) {
    throw new Error("No world address provided");
  }

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
    chain,
    chainId,
    modeUrl: params.get("mode") ?? chain.modeUrl,
    faucetServiceUrl: params.get("faucet") ?? chain.faucetUrl,
    worldAddress,
    initialBlockNumber: Number(params.get("initialBlockNumber")) || deploy.blockNumber || 0,
    devMode: params.get("dev") === "true",
  };
}
