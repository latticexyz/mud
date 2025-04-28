import { useChains } from "wagmi";
import { MUDChain } from "@latticexyz/common/chains";

export function useAppChain(): MUDChain {
  const chainId = 31337; // TODO: import from config
  const chains = useChains();
  const chain = chains.find((c) => c.id === chainId);
  if (!chain) {
    throw new Error(
      `Account Kit is configured to use chain ${chainId}, but the corresponding chain was not found in wagmi's configured chains.`,
    );
  }
  return chain;
}
