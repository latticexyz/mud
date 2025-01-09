import { Hex, getCreate2Address } from "viem";
import { singletonSalt } from "./common";

export function getContractAddress({
  deployerAddress,
  bytecode,
  salt = singletonSalt,
}: {
  readonly deployerAddress: Hex;
  readonly bytecode: Hex;
  readonly salt?: Hex;
}): Hex {
  return getCreate2Address({ from: deployerAddress, bytecode, salt });
}
