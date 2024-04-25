import { formatEther } from "viem";

export function formatBalance(wei: bigint) {
  // TODO: should this support non-ether decimals?
  const formatted = formatEther(wei);
  const magnitude = Math.floor(parseFloat(formatted)).toString().length;
  return parseFloat(formatted).toLocaleString("en-US", { maximumFractionDigits: Math.max(0, 6 - magnitude) });
}
