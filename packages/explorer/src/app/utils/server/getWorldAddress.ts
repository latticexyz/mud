import { headers } from "next/headers";
import { Hex, isAddress } from "viem";

export function getWorldAddress(): Hex {
  const headersList = headers();
  const worldAddress = headersList.get("x-world-address") || process.env.NEXT_PUBLIC_WORLD_ADDRESS;

  if (!worldAddress) {
    throw new Error("World address not found");
  } else if (!isAddress(worldAddress)) {
    throw new Error("Invalid world address");
  }

  return worldAddress as Hex;
}
