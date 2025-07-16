import { AbiFunction, AbiItem, Hex } from "viem";

export type WorldFunction = {
  readonly signature: string;
  readonly selector: Hex;
  readonly systemId: Hex;
  readonly systemFunctionSignature: string;
  readonly systemFunctionSelector: Hex;
};

export function isAbiFunction(abiItem: AbiItem): abiItem is AbiFunction {
  return abiItem.type === "function";
}
