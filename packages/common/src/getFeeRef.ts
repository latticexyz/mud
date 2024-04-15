import { CreateFeeRefOptions, FeeRef, createFeeRef } from "./createFeeRef";

let feeRef: FeeRef | undefined;

export async function getFeeRef(opts: CreateFeeRefOptions): Promise<FeeRef> {
  feeRef ??= await createFeeRef(opts);
  return feeRef;
}
