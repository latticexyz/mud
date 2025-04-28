import { useEffect, useRef } from "react";
import { useAccount, useBalance, useWatchBlockNumber } from "wagmi";
import { ChainSelect } from "./ChainSelect";
import { AmountInput } from "./AmountInput";
import { twMerge } from "tailwind-merge";
import { PendingIcon } from "../../icons/PendingIcon";
import { formatGas } from "./formatGas";
import { SubmitButton } from "./SubmitButton";
import { useIsMounted } from "usehooks-ts";
import { WarningIcon } from "../../icons/WarningIcon";
import { Balance } from "./Balance";
import { useShowQueryError } from "../../errors/useShowQueryError";
import { Chain } from "viem";

export const DEFAULT_DEPOSIT_AMOUNT = 0.005;

export type Props = {
  sourceChain: Chain;
  setSourceChainId: (chainId: number) => void;
  amount: bigint | undefined;
  setAmount: (amount: bigint | undefined) => void;
  // TODO: add errors
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
  useWatchBlockNumber({ onBlockNumber: () => balance.refetch() });

  const minimumBalance = amount != null ? amount + (estimatedFee?.fee ?? 0n) : undefined;
  const hasMinimumBalance = balance.data != null ? balance.data.value > (minimumBalance ?? 0n) : undefined;

  // Re-focus input if chain ID changes (otherwise the chain select is still in focus)
  useEffect(() => {
    amountInputRef.current?.focus();
  }, [userChainId]);

  useEffect(() => {
    if (balance.error) {
      console.error("Failed to get balance for", userAddress, "on", sourceChain.id, balance.error);
    }
  }, [balance.error, sourceChain.id, userAddress]);

  useEffect(() => {
    if (estimatedFee.error) {
      console.error("Failed to estimate fee, deposit from", sourceChain.id, estimatedFee.error);
    }
  }, [estimatedFee.error, sourceChain.id, userAddress]);

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
        <AmountInput
          ref={amountInputRef}
          // TODO: fix issue where this causes `.4` to re-render as `0.4` (because `initialAmount` is bigint)
          //       might need to move up amount state and separate string state from parsed amount
          initialAmount={amount}
          onChange={setAmount}
        />
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
            <Balance amount={balance.data.value} />
          ) : balance.isError ? (
            <span title={String(balance.error)}>
              <WarningIcon className="inline-block text-amber-500" />
            </span>
          ) : balance.isLoading ? (
            <PendingIcon className="inline-block text-xs" />
          ) : null}
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
