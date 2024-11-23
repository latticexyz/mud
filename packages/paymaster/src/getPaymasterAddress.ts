import { Chain, getChainContractAddress } from "viem";

export function getPaymasterAddress(chain: Chain) {
  return getChainContractAddress({ chain, contract: "quarryPaymaster" });
}
