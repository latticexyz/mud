import { headers } from "next/headers";
import { Hex } from "viem";

export function getWorldAddress(): Hex | undefined {
  const headersList = headers();
  const worldAddress = headersList.get("x-world-address") || process.env.NEXT_PUBLIC_WORLD_ADDRESS;

  if (!worldAddress) {
    throw new Error("World address not found");
  }

  return worldAddress as Hex;
}
