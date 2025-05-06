import { useEffect, useRef } from "react";
import { Chain } from "viem";
import { useAccount, useBalance, useWatchBlockNumber } from "wagmi";
import { useIsMounted } from "usehooks-ts";
import { twMerge } from "tailwind-merge";
import { useShowQueryError } from "../../errors/useShowQueryError";
import { useBalance as useQuarryBalance } from "../quarry/useBalance";
import { ChainSelect } from "./ChainSelect";
import { AmountInput } from "./AmountInput";
import { PendingIcon } from "../../icons/PendingIcon";
import { SubmitButton } from "./SubmitButton";
import { WarningIcon } from "../../icons/WarningIcon";
import { formatGas } from "../../formatGas";
import { Balance } from "../../ui/Balance";

export const DEFAULT_DEPOSIT_AMOUNT = 0.005;

export type Props = {
  sourceChain: Chain;
  setSourceChainId: (chainId: number) => void;
  amount: bigint | undefined;
  setAmount: (amount: bigint | undefined) => void;
  estimatedFee: {
    fee?: bigint | undefined;
    isLoading?: boolean | undefined;
    error: Error | undefined;
  };
  estimatedTime: string;
  onSubmit: () => Promise<void>;
  submitButton: React.ReactNode;
};

export function DepositForm({
  sourceChain,
  setSourceChainId,
  amount,
  setAmount,
  estimatedFee,
  estimatedTime,
  onSubmit,
  submitButton,
}: Props) {
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  const isMounted = useIsMounted();

  const { address: userAddress, chainId: userChainId } = useAccount();
  const balance = useShowQueryError(useBalance({ chainId: sourceChain.id, address: userAddress }));
  const quarryBalance = useShowQueryError(useQuarryBalance(userAddress));
  useWatchBlockNumber({
    onBlockNumber: () => {
      balance.refetch();
      quarryBalance.refetch();
    },
  });

  const minimumBalance = amount != null ? amount + (estimatedFee?.fee ?? 0n) : undefined;
  const hasMinimumBalance = balance.data != null ? balance.data.value > (minimumBalance ?? 0n) : undefined;

  // Re-focus input if chain ID changes (otherwise the chain select is still in focus)
  useEffect(() => {
    amountInputRef.current?.focus();
  }, [userChainId]);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (event) => {
        event.preventDefault();

        try {
          await onSubmit();
          if (isMounted()) {
            setAmount(undefined);
            if (amountInputRef.current) {
              amountInputRef.current.value = "";
            }
          }
        } catch (error) {
          // Let's hope each deposit form's wrapper is rendering its own errors
          console.error("Error during deposit", error);
        } finally {
          // Re-focus input after submit (otherwise the submit button is still in focus)
          amountInputRef.current?.focus();
        }
      }}
    >
      <div className="flex gap-2">
        <ChainSelect value={sourceChain.id} onChange={setSourceChainId} />
        <AmountInput ref={amountInputRef} initialAmount={amount} onChange={setAmount} />
      </div>

      <dl
        className={twMerge(
          "grid grid-cols-2 divide-y text-sm leading-loose [&_>_:is(dt,dd)]:px-1 [&_>_dd]:text-right",
          "divide-neutral-200 text-neutral-500",
          "dark:divide-neutral-700 dark:text-neutral-400",
        )}
      >
        <dt>Available to deposit</dt>
        <dd>
          {balance.isSuccess ? (
            <Balance wei={balance.data.value} />
          ) : balance.isError ? (
            <span title={String(balance.error)}>
              <WarningIcon className="inline-block text-amber-500" />
            </span>
          ) : balance.isLoading ? (
            <PendingIcon className="inline-block text-xs" />
          ) : null}
        </dd>

        <dt>Gas balance after deposit</dt>
        <dd>
          <Balance wei={(quarryBalance.data ?? 0n) + (amount ?? 0n)} />
        </dd>

        <dt>Estimated fee</dt>
        <dd>
          {estimatedFee.fee ? (
            <>{formatGas(estimatedFee.fee)} gwei</>
          ) : estimatedFee.error ? (
            <span title={String(estimatedFee.error)}>
              <WarningIcon className="inline-block text-amber-500" />
            </span>
          ) : estimatedFee.isLoading ? (
            <PendingIcon className="inline-block text-xs" />
          ) : null}
        </dd>
        <dt>Time to deposit</dt>
        <dd>{estimatedTime}</dd>
      </dl>

      {hasMinimumBalance ? submitButton : <SubmitButton disabled>Not enough funds</SubmitButton>}
    </form>
  );
}
