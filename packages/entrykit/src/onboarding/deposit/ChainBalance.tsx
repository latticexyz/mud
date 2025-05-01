import { Hex } from "viem";
import { useBalance } from "wagmi";
import { PendingIcon } from "../../icons/PendingIcon";
import { Balance } from "../../ui/Balance";

export type Props = {
  chainId: number;
  address: Hex | undefined;
};

export function ChainBalance({ chainId, address }: Props) {
  const balance = useBalance({ chainId, address });
  return <>{balance.data ? <Balance wei={balance.data.value} /> : <PendingIcon />}</>;
}
