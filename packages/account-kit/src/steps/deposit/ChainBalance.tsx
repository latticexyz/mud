import { Hex } from "viem";
import { useBalance } from "wagmi";
import { PendingIcon } from "../../icons/PendingIcon";
import { formatBalance } from "./formatBalance";

export type Props = {
  chainId: number;
  address: Hex | undefined;
};

export function ChainBalance({ chainId, address }: Props) {
  const balance = useBalance({ chainId, address });
  return <>{balance.data ? <>{formatBalance(balance.data.value)} Ξ</> : <PendingIcon />}</>;
}
