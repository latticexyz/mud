import { AbiFunction, toFunctionHash } from "viem";

export function getFunctionElementId(functionAbi: AbiFunction, systemId?: string) {
  return `${systemId || "core"}-${toFunctionHash(functionAbi)}`;
}
