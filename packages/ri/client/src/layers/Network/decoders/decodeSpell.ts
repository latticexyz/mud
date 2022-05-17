import { defaultAbiCoder as abi } from "ethers/lib/utils";

/**
 * Decode encoded contract component data to decoded client component value
 * @param data Abi encoded contract component value
 * @returns Decoded WorldCoord
 */
export function decodeSpell(data: string): { embodiedSystemSelector: string; spellTargetFilter: number } {
  const decoded = abi.decode(["uint256", "uint256"], data);
  console.log("decoded", decoded);
  return { embodiedSystemSelector: decoded[0].toHexString(), spellTargetFilter: decoded[1].toNumber() };
}
