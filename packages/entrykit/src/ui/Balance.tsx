import { EthIcon } from "../icons/EthIcon";
import { formatBalance } from "../formatBalance";
import { formatEther } from "viem";

export type Props = {
  wei: bigint;
};

export function Balance({ wei }: Props) {
  return (
    <span className="inline-flex items-center gap-1" title={formatEther(wei)}>
      {formatBalance(wei)} <EthIcon />
    </span>
  );
}
