import { EthIcon } from "../../icons/EthIcon";
import { formatBalance } from "./formatBalance";

type Props = {
  /** amount in wei */
  amount: bigint;
};

export function Balance({ amount }: Props) {
  return (
    <span className="inline-flex items-center gap-1">
      {formatBalance(amount)} <EthIcon />
    </span>
  );
}
