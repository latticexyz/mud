import { useAccount, useBalance } from "wagmi";
import { ChainSelect } from "./ChainSelect";
import { AmountInput } from "./AmountInput";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { useQueryClient } from "@tanstack/react-query";
import { twMerge } from "tailwind-merge";
import { PendingIcon } from "../../icons/PendingIcon";
import { formatBalance } from "./formatBalance";
import { formatGas } from "./formatGas";
import { DepositMethod, SourceChain } from "./common";
import { ReactNode, useEffect, useRef } from "react";
import { SubmitButton } from "./SubmitButton";

export const DEFAULT_DEPOSIT_AMOUNT = 0.005;

export type Props = {
  sourceChain: SourceChain;
  setSourceChainId: (chainId: number) => void;
  amount: bigint | undefined;
  setAmount: (amount: bigint | undefined) => void;
  depositMethod: DepositMethod;
  setDepositMethod: (depositMethod: DepositMethod) => void;
  estimatedFee?: bigint | undefined;
  estimatedTime: string;
  submitButton: ReactNode;
  onSubmit: () => Promise<void>;
  isComplete?: boolean;
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
  isComplete,
  submitButton,
  transactionStatus,
}: Props) {
  const { address: userAddress, chainId: userChainId } = useAccount();
  const queryClient = useQueryClient();
  const { resetStep } = useOnboardingSteps();
  const balance = useBalance({ chainId: sourceChain.id, address: userAddress });

  const amountInputRef = useRef<HTMLInputElement | null>(null);

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
      onSubmit={async (event) => {
        event.preventDefault();

        const previousAmount = amount;
        const previousInputValue = amountInputRef.current?.value;
        setAmount(undefined);
        if (amountInputRef.current) {
          amountInputRef.current.value = "";
        }

        try {
          await onSubmit();
        } catch (error) {
          setAmount(previousAmount);
          if (previousInputValue != null && amountInputRef.current && amountInputRef.current.value === "") {
            amountInputRef.current.value = previousInputValue;
          }
          throw error;
        }
      }}
    >
      <div className="flex gap-2">
        <ChainSelect value={sourceChain.id} onChange={setSourceChainId} />
        <AmountInput
          // Using the user's chain ID as the `key` here forces this to re-render when the chain switches,
          // thus causing this input to auto focus and reduces the need to click the input again.
          key={userChainId}
          ref={amountInputRef}
          initialAmount={amount}
          onChange={setAmount}
        />
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
        <dd>{estimatedTime}</dd>
      </dl>

      {balance.data != null && amount != null && balance.data.value < amount + (estimatedFee ?? 0n) ? (
        <SubmitButton disabled>Not enough funds</SubmitButton>
      ) : (
        submitButton
      )}

      {transactionStatus}
    </form>
  );
}
