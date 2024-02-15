import { createContext, type ReactNode, useContext } from "react";
import { type Hex } from "viem";
import { usePublicClient, useWalletClient, type WalletClient, type PublicClient } from "wagmi";
import { Subject } from "rxjs";
import { type ContractWrite, getContract } from "@latticexyz/common";
import { supportedChains } from "./supportedChains";
import worlds from "contracts/worlds.json";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

export type NetworkConfig = ReturnType<typeof getNetworkConfig>;

export function getNetworkConfig() {
  const params = new URLSearchParams(window.location.search);
  const chainId = Number(params.get("chainId") || params.get("chainid") || import.meta.env.VITE_CHAIN_ID || 31337);
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
    : world?.blockNumber ?? 0n;

  return {
    chainId,
    chain,
    worldAddress: worldAddress as Hex,
    initialBlockNumber,
  };
}

const NetworkConfigContext = createContext<NetworkConfig | null>(null);

type Props = {
  children: ReactNode;
  config: NetworkConfig;
};

export const NetworkConfigProvider = ({ children, config }: Props) => {
  const currentValue = useContext(NetworkConfigContext);
  if (currentValue) throw new Error("NetworkConfigProvider can only be used once");
  return <NetworkConfigContext.Provider value={config}>{children}</NetworkConfigContext.Provider>;
};

export const useNetworkConfig = () => {
  const value = useContext(NetworkConfigContext);
  if (!value) throw new Error("Must be used within a NetworkConfigProvider");
  return value;
};

const getWorldContract = (address: Hex, publicClient: PublicClient, walletClient: WalletClient) => {
  const write$ = new Subject<ContractWrite>();
  const worldContract = getContract({
    address,
    abi: IWorldAbi,
    publicClient,
    walletClient,
    onWrite: (write) => write$.next(write),
  });

  return { worldContract, write$ };
};

export const useWorldContract = () => {
  const networkConfig = useNetworkConfig();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  if (!walletClient) {
    throw new Error("useWorldContract is used incorrectly");
  }

  const worldContract = getWorldContract(networkConfig.worldAddress, publicClient, walletClient);

  return { worldContract, networkConfig, publicClient, walletClient };
};
