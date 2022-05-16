import { defaultAbiCoder as abi } from "ethers/lib/utils";
import { EntityTypes } from "../types";

/**
 * Decode encoded contract component data to decoded client component value
 * @param data Abi encoded contract component value
 * @returns Decoded EntityType component value
 */
export function decodeEntityType(data: string): { entityType: EntityTypes } {
  const decoded = abi.decode(["uint256"], data);
  return { entityType: decoded[0].toNumber() as EntityTypes };
}
