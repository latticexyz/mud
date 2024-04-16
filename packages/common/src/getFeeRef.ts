import { getChainId } from "viem/actions";
import { CreateFeeRefOptions, FeeRef, createFeeRef } from "./createFeeRef";

const feeRefs = new Map<number, FeeRef>();

export async function getFeeRef(opts: CreateFeeRefOptions): Promise<FeeRef> {
  const chainId = opts.args?.chain?.id ?? opts.client.chain?.id ?? (await getChainId(opts.client));

  const existingFeeRef = feeRefs.get(chainId);
  if (existingFeeRef) {
    return existingFeeRef;
  }

  const feeRef = await createFeeRef(opts);
  feeRefs.set(chainId, feeRef);
  return feeRef;
}
