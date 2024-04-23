import { useBlock } from "wagmi";
import { useConfig } from "./AccountKitConfigProvider";

// TODO: figure out a better name
export function useIsFree() {
  const { chainId } = useConfig();
  // TODO: cache indefinitely?
  const { data: block } = useBlock({ chainId });
  return block?.baseFeePerGas === 0n;
}
