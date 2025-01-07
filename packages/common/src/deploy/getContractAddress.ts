import { Hex, getCreate2Address } from "viem";
import { singletonSalt } from "./common";

export function getContractAddress({
  deployerAddress,
  bytecode,
}: {
  readonly deployerAddress: Hex;
  readonly bytecode: Hex;
}): Hex {
  return getCreate2Address({ from: deployerAddress, bytecode, salt: singletonSalt });
}
