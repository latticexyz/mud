import { defaultAbiCoder as abi } from "ethers/lib/utils";
import { Entity } from "@mud/recs";

/**
 * Decode encoded contract component data to decoded client component value
 * @param data Abi encoded contract component value
 * @returns Decoded Untraversable component value
 */
export function decodeUntraversable(data: string): { traversableBy: Entity[] } {
  const decoded = abi.decode(["uint256[]"], data);
  return { traversableBy: decoded[0] };
}
