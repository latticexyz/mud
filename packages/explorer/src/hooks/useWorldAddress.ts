import { Hex } from "viem";

export function useWorldAddress(): Hex {
  const searchParams = new URLSearchParams(window.location.search);
  const worldAddress = searchParams.get("worldAddress") || process.env.NEXT_PUBLIC_WORLD_ADDRESS;

  if (!worldAddress) {
    throw new Error("World address not found");
  }

  return worldAddress as Hex;
}
