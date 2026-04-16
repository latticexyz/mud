import { formatEther } from "viem";

export function formatBalance(wei: bigint) {
  // TODO: should this support non-ether decimals?
  const formatted = formatEther(wei);
  const parsed = parseFloat(formatted);

  if (parsed > 0 && parsed < 0.00001) {
    return "<0.00001";
  }

  const magnitude = Math.floor(parsed).toString().length;
  return parsed.toLocaleString("en-US", { maximumFractionDigits: Math.max(0, 6 - magnitude) });
}
