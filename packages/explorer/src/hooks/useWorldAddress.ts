import { useSearchParams } from "next/navigation";
import { Hex, isAddress } from "viem";

export function useWorldAddress(): Hex {
  const searchParams = useSearchParams();
  const worldAddress = searchParams.get("worldAddress") || process.env.NEXT_PUBLIC_WORLD_ADDRESS;

  if (!worldAddress) {
    throw new Error("World address not found");
  } else if (!isAddress(worldAddress)) {
    throw new Error("Invalid world address");
  }

  return worldAddress as Hex;
}
