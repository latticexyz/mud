import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { ChainSelect } from "./ChainSelect";
import { AmountInput } from "./AmountInput";
import { Button } from "../../ui/Button";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { useQueryClient } from "@tanstack/react-query";
import { twMerge } from "tailwind-merge";
import { PendingIcon } from "../../icons/PendingIcon";
import { duration } from "itty-time";
import { formatBalance } from "./formatBalance";
import { formatGas } from "./formatGas";
import { DepositMethod, SourceChain } from "./common";
import { ReactNode, useEffect } from "react";

export const DEFAULT_DEPOSIT_AMOUNT = 0.005;

export type Props = {
  sourceChain: SourceChain;
  setSourceChainId: (chainId: number) => void;
  amount: bigint | undefined;
  setAmount: (amount: bigint | undefined) => void;
  depositMethod: DepositMethod;
  setDepositMethod: (depositMethod: DepositMethod) => void;
  estimatedFee?: bigint | undefined;
  estimatedTime?: number | undefined;
  // TODO: should we use UseWriteContractReturnType instead?
  // TODO: `undefined` here is meant to capture "pending requirements for onSubmit", but maybe we need a better way to express this, like `useQuery`'s `enabled`
  onSubmit: (() => Promise<void>) | undefined;
  disabled?: boolean;
  pending?: boolean;
  isComplete?: boolean;
  submitButtonLabel?: string;
  transactionStatus?: ReactNode;
};

export function DepositForm({
  sourceChain,
  setSourceChainId,
  amount,
  setAmount,
  depositMethod,
  setDepositMethod,
  estimatedFee,
  estimatedTime,
  onSubmit,
  disabled,
  pending,
  isComplete,
  submitButtonLabel = "Deposit",
  transactionStatus,
}: Props) {
  const { address: userAddress, chainId: userChainId } = useAccount();
  const shouldSwitchChain = userChainId !== sourceChain.id;
  const switchChain = useSwitchChain();
  const queryClient = useQueryClient();
  const { resetStep } = useOnboardingSteps();
  const balance = useBalance({ chainId: sourceChain.id, address: userAddress });

  const selectedMethod = sourceChain.depositMethods.includes(depositMethod)
    ? depositMethod
    : sourceChain.depositMethods[0];

  useEffect(() => {
    if (isComplete) {
      queryClient.invalidateQueries().then(resetStep);
    }
  }, [isComplete, queryClient, resetStep]);

  return (
    <form
      className="flex flex-col px-5 gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <div className="flex gap-2">
        <ChainSelect value={sourceChain.id} onChange={setSourceChainId} />
        <AmountInput initialAmount={amount} onChange={setAmount} />
      </div>

      {sourceChain.depositMethods.length > 1 ? (
        <div className="grid grid-flow-col justify-stretch font-medium">
          {sourceChain.depositMethods.map((method) => (
            <button
              key={method}
              type="button"
              className={twMerge(
                "border border-transparent p-2 bg-neutral-200",
                "aria-selected:bg-transparent aria-selected:border-neutral-300 aria-selected:border-b-transparent",
                "hover:bg-neutral-300",
                // TODO: replace with nicer label
                "capitalize",
              )}
              aria-selected={method === selectedMethod}
              onClick={() => setDepositMethod(method)}
            >
              {method}
            </button>
          ))}
        </div>
      ) : null}

      <dl
        className={twMerge(
          "grid grid-cols-2 divide-y text-sm leading-loose [&_>_:is(dt,dd)]:px-1 [&_>_dd]:text-right",
          "divide-neutral-200 text-neutral-500",
          "dark:divide-neutral-700 dark:text-neutral-400",
        )}
      >
        <dt>Available to deposit</dt>
        <dd>
          {balance.data ? <>{formatBalance(balance.data.value)} Ξ</> : <PendingIcon className="inline-block text-xs" />}
        </dd>
        <dt>Estimated fee</dt>
        <dd>{estimatedFee ? <>{formatGas(estimatedFee)} gwei</> : <PendingIcon className="inline-block text-xs" />}</dd>
        <dt>Time to deposit</dt>
        <dd>
          {estimatedTime == null ? (
            <PendingIcon className="inline-block text-xs" />
          ) : estimatedTime === 0 ? (
            <>Instant</>
          ) : (
            <>{duration(estimatedTime * 1000, { parts: 1 })}</>
          )}
        </dd>
      </dl>

      {/* TODO: show message when no balance */}

      {shouldSwitchChain ? (
        <Button
          type="button"
          className="w-full"
          pending={switchChain.isPending}
          onClick={() => switchChain.switchChain({ chainId: sourceChain.id })}
        >
          Switch chain
        </Button>
      ) : (
        <Button
          type="submit"
          className="w-full"
          pending={pending}
          disabled={disabled || !onSubmit || balance.data?.value === 0n}
        >
          {submitButtonLabel}
        </Button>
      )}

      {transactionStatus}
    </form>
  );
}
