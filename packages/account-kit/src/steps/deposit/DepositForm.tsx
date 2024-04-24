import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { ChainSelect } from "./ChainSelect";
import { AmountInput } from "./AmountInput";
import { Button } from "../../ui/Button";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { useQueryClient } from "@tanstack/react-query";
import { twMerge } from "tailwind-merge";
import { PendingIcon } from "../../icons/PendingIcon";
import { duration } from "itty-time";
import { useSourceChains } from "./useSourceChains";
import { formatBalance } from "./formatBalance";
import { formatGas } from "./formatGas";

export const DEFAULT_DEPOSIT_AMOUNT = 0.005;

export type Props = {
  sourceChainId: number;
  setSourceChainId: (chainId: number) => void;
  amount: bigint | undefined;
  setAmount: (amount: bigint | undefined) => void;
  estimatedFee?: bigint | undefined;
  estimatedTime?: number | undefined;
  // TODO: should we use UseWriteContractReturnType instead?
  // TODO: `undefined` here is meant to capture "pending requirements for onSubmit", but maybe we need a better way to express this, like `useQuery`'s `enabled`
  onSubmit: (() => Promise<void>) | undefined;
  disabled?: boolean;
  pending?: boolean;
  submitButtonLabel?: string;
};

export function DepositForm({
  sourceChainId,
  setSourceChainId,
  amount,
  setAmount,
  estimatedFee,
  estimatedTime,
  onSubmit,
  disabled,
  pending,
  submitButtonLabel = "Deposit",
}: Props) {
  const { address: userAddress, chainId: userChainId } = useAccount();
  const shouldSwitchChain = userChainId !== sourceChainId;
  const switchChain = useSwitchChain();
  const queryClient = useQueryClient();
  const { resetStep } = useOnboardingSteps();
  const balance = useBalance({ chainId: sourceChainId, address: userAddress });
  const sourceChains = useSourceChains();
  const sourceChain = sourceChains.find((c) => c.id === sourceChainId);

  // TODO: better state if a chain is selected that is not supported
  //       maybe pending since source chains still may be loading in?
  if (!sourceChain) {
    return null;
  }

  return (
    <form
      className="flex flex-col px-5 gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        // TODO: return (optional) tx hash from onSubmit so we can wait for it here
        await onSubmit?.();
        await queryClient.invalidateQueries();
        resetStep();
      }}
    >
      <div className="flex gap-2">
        <ChainSelect value={sourceChainId} onChange={setSourceChainId} />
        <AmountInput initialAmount={amount} onChange={setAmount} />
      </div>

      {sourceChain.depositMethods.length > 1 ? (
        <div className="grid grid-flow-col justify-stretch font-medium">
          {sourceChain.depositMethods.map((depositMethod) => (
            <button
              key={depositMethod}
              type="button"
              className={twMerge(
                "border border-transparent p-2 bg-neutral-200",
                "aria-selected:bg-transparent aria-selected:border-neutral-300 aria-selected:border-b-transparent",
                "hover:bg-neutral-300",
              )}
              // aria-selected
            >
              {/* TODO: convert to nicer label */}
              {depositMethod}
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

      {shouldSwitchChain ? (
        <Button
          type="button"
          className="w-full"
          pending={switchChain.isPending}
          onClick={() => switchChain.switchChain({ chainId: sourceChainId })}
        >
          Switch chain
        </Button>
      ) : (
        <Button type="submit" className="w-full" pending={pending || !onSubmit} disabled={disabled}>
          {submitButtonLabel}
        </Button>
      )}
    </form>
  );
}
