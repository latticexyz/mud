import { useSearchParams } from "next/navigation";
import { Hex, isAddress } from "viem";

export function useWorldAddress(): Hex {
  const searchParams = useSearchParams();

  let worldAddress = searchParams.get("worldAddress") || process.env.NEXT_PUBLIC_WORLD_ADDRESS;
  if (!worldAddress) {
    const worldsConfig = process.env.NEXT_PUBLIC_WORLDS_CONFIG;
    if (worldsConfig) {
      const chainId = searchParams.get("chainId") || process.env.NEXT_PUBLIC_CHAIN_ID || 31337;
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
