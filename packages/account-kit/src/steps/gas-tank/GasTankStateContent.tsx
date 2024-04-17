import { formatEther, parseEther } from "viem";
import { twMerge } from "tailwind-merge";
import { GasTankIcon } from "../../icons/GasTankIcon";
import { useGasTankBalance } from "../../useGasTankBalance";
import { formatActionsNumber } from "./utils/formatActionsNumber";

type GasTankStateContentProps = {
  amount: string;
  isSuccess: boolean;
};

const ACTIONS_PER_ETHER = 100_000n;

export function GasTankStateContent({ amount, isSuccess }: GasTankStateContentProps) {
  const { gasTankBalance } = useGasTankBalance();
  const amountWei = parseEther(amount);
  const newGasTankBalance = gasTankBalance ? gasTankBalance + amountWei : amountWei;
  const estimateActions = (ACTIONS_PER_ETHER * amountWei) / BigInt(1e18);
  const isTankEmpty = !gasTankBalance || gasTankBalance === 0n;
  const isAmountSet = Boolean(amountWei > 0n);

  return (
    <div
      className={twMerge(
        "flex items-center gap-[12px] bg-neutral-200 p-5",
        isSuccess && "bg-green-900 text-white",
        !isSuccess && "bg-neutral-200 text-black",
      )}
    >
      <GasTankIcon
        className={twMerge(
          "flex-shrink-0",
          isTankEmpty && "text-red-500",
          isAmountSet && "text-neutral-800",
          isSuccess && "text-green-500",
        )}
      />

      {isTankEmpty && !isAmountSet && <p className="font-mono text-[22px] uppercase">Empty</p>}
      {isSuccess && (
        <div className="flex justify-between items-center w-full">
          <p className="font-mono text-[22px]">{formatEther(gasTankBalance)}Ξ</p>
          <p className="font-mono text-[14px] text-neutral-700">~{formatActionsNumber(estimateActions)} actions</p>
        </div>
      )}
      {!isTankEmpty && !isAmountSet && !isSuccess && (
        <div className="flex justify-between items-center w-full">
          <p className="font-mono text-[22px]">{formatEther(gasTankBalance)}Ξ</p>
          <p className="font-mono text-[14px] text-neutral-700">~{formatActionsNumber(estimateActions)} actions</p>
        </div>
      )}
      {!isSuccess && isAmountSet && (
        <div className="flex justify-between items-center w-full">
          <p className="font-mono text-[22px]">
            {formatEther(gasTankBalance ?? 0n)} <span className="text-green-500">→</span>{" "}
            {formatEther(newGasTankBalance!)}Ξ
          </p>
          <p className="font-mono text-[14px] text-neutral-700">~{formatActionsNumber(estimateActions)} actions</p>
        </div>
      )}
    </div>
  );
}
