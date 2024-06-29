import { useChains } from "wagmi";
import { useConfig } from "./AccountKitConfigProvider";
import { MUDChain } from "@latticexyz/common/chains";

export function useAppChain(): MUDChain {
  const { chainId } = useConfig();
  const chains = useChains();
  const chain = chains.find((c) => c.id === chainId);
  if (!chain) {
    throw new Error(
      `Account Kit is configured to use chain ${chainId}, but the corresponding chain was not found in wagmi's configured chains.`,
    );
  }
  return chain;
}
