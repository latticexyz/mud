import { headers } from "next/headers";
import { Hex, isAddress } from "viem";

export function getWorldAddress(): Hex {
  const headersList = headers();

  let worldAddress = headersList.get("x-world-address") || process.env.NEXT_PUBLIC_WORLD_ADDRESS;
  if (!worldAddress) {
    const worldsConfig = process.env.NEXT_PUBLIC_WORLDS_CONFIG;
    if (worldsConfig) {
      const chainId = headersList.get("x-chain-id") || process.env.NEXT_PUBLIC_CHAIN_ID || 31337;
      const worlds = JSON.parse(worldsConfig);
      worldAddress = worlds[chainId]?.address;
    }
  }

  if (!worldAddress) {
    throw new Error("World address not found");
  } else if (!isAddress(worldAddress)) {
    throw new Error("Invalid world address");
  }

  return worldAddress as Hex;
}
