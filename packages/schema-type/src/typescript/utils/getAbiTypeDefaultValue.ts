import { AbiTypeToPrimitiveType } from "../mappings";
import { AbiTypeToDefaultValue } from "../mappings/AbiTypeToDefaultValue";

/**
 * Return a value corresponding to the Solidity default value for a given abi type
 */
export function getAbiTypeDefaultValue<T extends string>(abiType: T) {
  // Remove fixed array lengths (eg map uint256[10] to uint256[])
  const normalizedType = abiType.replace(/(\w+)\[\d+\]/g, "$1[]");
  return AbiTypeToDefaultValue[normalizedType as keyof typeof AbiTypeToDefaultValue] as AbiTypeToPrimitiveType<T>;
}
