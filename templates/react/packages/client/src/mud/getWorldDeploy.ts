import { Address } from "viem";

export async function getWorldDeploy(chainId: number): Promise<{
  chainId: number;
  address: Address;
  blockNumber: bigint | null;
}> {
  // TODO: figure out how to catch vite:import-analysis error when this file is missing
  const { default: worlds } = await import("contracts/worlds.json").catch((error) => {
    console.debug("Could not import worlds.json", error);
    return { default: null };
  });
  const deploy = worlds?.[`${chainId}`];
  if (!deploy) {
    throw new Error(`No world deploy found for chain ${chainId} in "worlds.json".`);
  }
  console.log("chain:", chainId, "world:", deploy);
  return {
    chainId,
    address: deploy.address,
    blockNumber: deploy.blockNumber != null ? BigInt(deploy.blockNumber) : null,
  };
}
