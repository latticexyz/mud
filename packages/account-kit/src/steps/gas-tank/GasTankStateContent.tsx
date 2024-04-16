import { formatEther } from "viem";
import { GasTankIcon } from "../../icons/GasTankIcon";
import { useGasTankBalance } from "../../useGasTankBalance";

type GasTankStateContentProps = {
  amount: bigint | null;
};

export function GasTankStateContent({ amount = BigInt(0) }: GasTankStateContentProps) {
  const gasTankBalance = useGasTankBalance();
  const newGasTankBalance = gasTankBalance ? gasTankBalance + amount! : amount;
  const estimateActions = BigInt(15000); // TODO: estimate gas tank actions
  const isTankEmpty = !gasTankBalance || gasTankBalance === BigInt(0);
  const isAmountSet = Boolean(amount && amount > BigInt(0));

  return (
    <div className="flex flex-col gap-2 bg-neutral-200 p-5">
      <GasTankIcon className={isTankEmpty && !isAmountSet ? "text-red-500" : "text-neutral-800"} />

      {isTankEmpty && !isAmountSet && <p>Empty</p>}
      {isAmountSet && (
        <div className="flex flex-justify">
          <p>
            {formatEther(gasTankBalance || BigInt(0))} to {formatEther(newGasTankBalance!)}Ξ
          </p>
          <p>~{estimateActions.toString()} actions</p>
        </div>
      )}
    </div>
  );
}
