import { Address } from "viem";

export function getWorldUrl(chainName: string, worldAddress: Address) {
  return `/${chainName}/worlds/${worldAddress}`;
}
