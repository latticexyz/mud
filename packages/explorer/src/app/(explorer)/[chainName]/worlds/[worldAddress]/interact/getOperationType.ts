import { AbiFunction } from "viem";

export enum FunctionType {
  READ,
  WRITE,
}

// TODO: might not be needed
export function getOperationType(functionAbi: AbiFunction) {
  return functionAbi.stateMutability === "view" || functionAbi.stateMutability === "pure"
    ? FunctionType.READ
    : FunctionType.WRITE;
}
