import { Hex, formatEther } from "viem";
import { useBalance } from "wagmi";
import { PendingIcon } from "../../icons/PendingIcon";
import { truncateDecimal } from "./truncateDecimal";

export type Props = {
  chainId: number;
  address: Hex | undefined;
};

export function ChainBalance({ chainId, address }: Props) {
  const balance = useBalance({ chainId, address });
  // TODO: should this support non-ether decimals?
  return <>{balance.data ? <>{truncateDecimal(formatEther(balance.data.value))} Ξ</> : <PendingIcon />}</>;
}
