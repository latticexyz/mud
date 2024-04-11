import { CreateFeeRefOptions, FeeRef, createFeeRef } from "./createFeeRef";

let feeRef: FeeRef | undefined;

export function getFeeRef(opts: CreateFeeRefOptions): FeeRef {
  feeRef ??= createFeeRef(opts);
  return feeRef;
}
