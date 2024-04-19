import { useBlock } from "wagmi";
import { useConfig } from "./AccountKitProvider";

// TODO: figure out a better name
export function useIsFree() {
  const { chain } = useConfig();
  // TODO: cache indefinitely?
  const { data: block } = useBlock({ chainId: chain.id });
  return block?.baseFeePerGas === 0n;
}
