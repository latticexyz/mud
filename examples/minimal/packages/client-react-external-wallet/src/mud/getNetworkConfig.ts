import { type Hex } from "viem";
import worlds from "contracts/worlds.json";
import { supportedChains } from "./supportedChains";

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
    : world?.blockNumber ?? 0;

  return {
    chainId,
    chain,
    worldAddress: worldAddress as Hex,
    initialBlockNumber,
  };
}
