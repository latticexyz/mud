import { formatGwei } from "viem";

export function formatGas(wei: bigint) {
  // TODO: should this support non-ether decimals?
  return parseFloat(formatGwei(wei)).toLocaleString("en-US", { maximumFractionDigits: 5 });
}
