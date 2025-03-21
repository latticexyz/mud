import { AbiItem } from "viem";
import { keccak256, stringToHex } from "viem";

export function getErrorSelector(errorAbi: AbiItem) {
  if (errorAbi.type !== "error") {
    throw new Error("Abi item is not an error");
  }

  const inputTypes = errorAbi.inputs.map((input) => input.type);
  const signature = `${errorAbi.name}(${inputTypes.join(",")})`;
  const hash = keccak256(stringToHex(signature));

  return hash.slice(0, 10);
}
