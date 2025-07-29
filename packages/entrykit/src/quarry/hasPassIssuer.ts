import { Chain } from "viem";
import { getPaymaster } from "../getPaymaster";

export function hasPassIssuer(chain: Chain) {
  const paymaster = getPaymaster(chain, undefined);
  const passIssuerUrl = "quarryPassIssuer" in chain.rpcUrls ? chain.rpcUrls.quarryPassIssuer.http[0] : undefined;

  return paymaster?.type === "quarry" && passIssuerUrl;
}
