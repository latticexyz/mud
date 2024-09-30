import { useChains } from "wagmi";
import { useConfig } from "./EntryKitConfigProvider";
import { MUDChain } from "@latticexyz/common/chains";

export function useAppChain(): MUDChain {
  const { chainId } = useConfig();
  const chains = useChains();
  const chain = chains.find((c) => c.id === chainId);
  if (!chain) {
    throw new Error(
      `EntryKit is configured to use chain ${chainId}, but the corresponding chain was not found in wagmi's configured chains.`,
    );
  }
  return chain as never;
}
