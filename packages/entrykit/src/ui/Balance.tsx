import { EthIcon } from "../icons/EthIcon";
import { formatBalance } from "../formatBalance";

type Props = {
  wei: bigint;
};

export function Balance({ wei }: Props) {
  return (
    <span className="inline-flex items-center gap-1">
      {formatBalance(wei)} <EthIcon />
    </span>
  );
}
