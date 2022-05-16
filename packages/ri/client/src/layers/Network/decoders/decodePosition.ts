import { WorldCoord } from "../../../types";
import { defaultAbiCoder as abi } from "ethers/lib/utils";

/**
 * Decode encoded contract component data to decoded client component value
 * @param data Abi encoded contract component value
 * @returns Decoded WorldCoord
 */
export function decodePosition(data: string): WorldCoord {
  const decoded = abi.decode(["uint256", "uint256"], data);
  return { x: decoded[0].toNumber(), y: decoded[1].toNumber() };
}
