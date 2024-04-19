import { formatEther, parseEther } from "viem";
import { twMerge } from "tailwind-merge";
import { GasTankIcon } from "../../icons/GasTankIcon";
import { useGasTankBalance } from "../../useGasTankBalance";
import { formatActionsNumber } from "./utils/formatActionsNumber";

type GasTankStateContentProps = {
  amount: number | undefined;
  isSuccess: boolean;
};

// TODO: get from config
const ACTIONS_PER_ETHER = 100_000n;

export function GasTankStateContent({ amount, isSuccess }: GasTankStateContentProps) {
  const { gasTankBalance } = useGasTankBalance();
  const amountWei = parseEther(amount?.toString() ?? "0");
  const newGasTankBalance = gasTankBalance ? gasTankBalance + amountWei : amountWei;
  const estimateActions = (ACTIONS_PER_ETHER * amountWei) / BigInt(1e18);
  const isTankEmpty = !gasTankBalance || gasTankBalance === 0n;
  const isAmountSet = Boolean(amountWei > 0n);

  return (
    <div
      className={twMerge(
        "flex items-center gap-[12px] bg-neutral-200 p-5",
        isSuccess && "bg-green-900 text-white",
        !isSuccess && "bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white",
      )}
    >
      <GasTankIcon
        className={twMerge(
          "flex-shrink-0",
          isTankEmpty && "text-red-500",
          isAmountSet && !isSuccess && "text-neutral-800 dark:text-neutral-400",
          isSuccess && "text-green-500 dark:text-green-500",
        )}
      />

      {/* TODO: make this better */}
      {isTankEmpty && !isAmountSet && <p className="font-mono text-[22px] uppercase">Empty</p>}
      {isSuccess && (
        <div className="flex justify-between items-center w-full">
          <p className="font-mono text-[22px]">{formatEther(gasTankBalance)}Ξ</p>
          <p className="font-mono text-[14px] text-neutral-700 dark:text-neutral-300">
            ~{formatActionsNumber(estimateActions)} actions
          </p>
        </div>
      )}
      {!isTankEmpty && !isAmountSet && !isSuccess && (
        <div className="flex justify-between items-center w-full">
          <p className="font-mono text-[22px]">{formatEther(gasTankBalance)}Ξ</p>
          <p className="font-mono text-[14px] text-neutral-700 dark:text-neutral-300">
            ~{formatActionsNumber(estimateActions)} actions
          </p>
        </div>
      )}
      {!isSuccess && isAmountSet && (
        <div className="flex justify-between items-center w-full">
          <p className="font-mono text-[22px]">
            {formatEther(gasTankBalance ?? 0n)} <span className="text-green-500">→</span>{" "}
            {formatEther(newGasTankBalance!)}Ξ
          </p>
          <p className="font-mono text-[14px] text-neutral-700 dark:text-neutral-300">
            ~{formatActionsNumber(estimateActions)} actions
          </p>
        </div>
      )}
    </div>
  );
}
