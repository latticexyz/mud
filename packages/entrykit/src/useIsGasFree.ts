import { useBlock } from "wagmi";
import { useEntryKitConfig } from "./EntryKitConfigProvider";

// TODO: figure out a better name
export function useIsGasFree() {
  const { chainId } = useEntryKitConfig();
  const { data: block } = useBlock({
    chainId,
    query: {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  });
  return block?.baseFeePerGas === 0n;
}
