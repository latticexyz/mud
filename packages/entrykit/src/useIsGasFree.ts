import { useBlock } from "wagmi";
import { useConfig } from "./EntryKitConfigProvider";

// TODO: figure out a better name
export function useIsGasFree() {
  const { chainId } = useConfig();
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
