import { Hex, formatEther } from "viem";
import { useBalance } from "wagmi";

export type Props = {
  chainId: number;
  address: Hex | undefined;
};

export function ChainBalance({ chainId, address }: Props) {
  const balance = useBalance({ chainId, address });
  // TODO: should this support non-ether decimals?
  return <>{balance.data ? <>{formatEther(balance.data.value)} Ξ</> : null}</>;
}
