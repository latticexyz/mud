import { formatEther, parseEther } from "viem";
import { twMerge } from "tailwind-merge";
import { GasTankIcon } from "../../icons/GasTankIcon";
import { useGasTankBalance } from "../../useGasTankBalance";
import { formatActionsNumber } from "./utils/formatActionsNumber";

type GasTankStateContentProps = {
  amount: string;
};

const ACTIONS_PER_ETHER = BigInt(100_000);

export function GasTankStateContent({ amount }: GasTankStateContentProps) {
  const gasTankBalance = useGasTankBalance() || BigInt(0);
  const amountWei = BigInt(amount ? parseEther(amount) : 0);
  const newGasTankBalance = gasTankBalance ? gasTankBalance + amountWei : amountWei;
  const estimateActions = (ACTIONS_PER_ETHER * parseEther(amount)) / BigInt(1e18);
  const isTankEmpty = !gasTankBalance || gasTankBalance === BigInt(0);
  const isAmountSet = Boolean(amountWei > BigInt(0));

  return (
    <div className="flex items-center gap-[12px] bg-neutral-200 p-5">
      <GasTankIcon
        className={twMerge("flex-shrink-0", isTankEmpty && !isAmountSet ? "text-red-500" : "text-neutral-800")}
      />

      {isTankEmpty && !isAmountSet && <p className="font-mono text-[22px] uppercase">Empty</p>}
      {!isTankEmpty && !isAmountSet && (
        <div className="flex justify-between items-center w-full">
          <p className="font-mono text-[22px]">{formatEther(gasTankBalance)}Ξ</p>
          <p className="font-mono text-[14px] text-neutral-700">~{formatActionsNumber(estimateActions)} actions</p>
        </div>
      )}
      {isAmountSet && (
        <div className="flex justify-between items-center w-full">
          <p className="font-mono text-[22px]">
            {formatEther(gasTankBalance)} <span className="text-green-500">→</span> {formatEther(newGasTankBalance!)}Ξ
          </p>
          <p className="font-mono text-[14px] text-neutral-700">~{formatActionsNumber(estimateActions)} actions</p>
        </div>
      )}
    </div>
  );
}
