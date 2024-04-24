import { formatEther } from "viem";

export function formatBalance(wei: bigint) {
  // TODO: should this support non-ether decimals?
  return parseFloat(formatEther(wei)).toLocaleString("en-US", { maximumFractionDigits: 5 });
}
