import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { ChainSelect } from "./ChainSelect";
import { AmountInput } from "./AmountInput";
import { Button } from "../../ui/Button";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { useQueryClient } from "@tanstack/react-query";
import { twMerge } from "tailwind-merge";
import { PendingIcon } from "../../icons/PendingIcon";
import { formatEther, formatGwei } from "viem";
import { truncateDecimal } from "./truncateDecimal";
import { duration } from "itty-time";

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

  return (
    <form
      className="flex flex-col px-5 gap-2"
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

      <dl
        className={twMerge(
          "grid grid-cols-2 divide-y text-sm leading-loose [&_>_:is(dt,dd)]:px-1 [&_>_dd]:text-right",
          "divide-neutral-200 text-neutral-500",
          "dark:divide-neutral-700 dark:text-neutral-400",
        )}
      >
        <dt>Available to deposit</dt>
        <dd>
          {balance.data ? (
            <>{truncateDecimal(formatEther(balance.data.value))} Ξ</>
          ) : (
            <PendingIcon className="inline-block text-xs" />
          )}
        </dd>
        <dt>Estimated fee</dt>
        <dd>
          {estimatedFee ? (
            <>{truncateDecimal(formatGwei(estimatedFee))} gwei</>
          ) : (
            <PendingIcon className="inline-block text-xs" />
          )}
        </dd>
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

      {/* <BridgeTabs depositMethod={depositMethod} setDepositMethod={setDepositMethod} /> */}

      {/* <BalancesFees amount={depositAmount} depositMethod={depositMethod} /> */}

      {/* {error ? (
        <pre className="p-5 my-2 break-all whitespace-pre-wrap bg-red-200 text-red-700 border border-red-700">
          {String(error)}
        </pre>
      ) : null} */}
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

      {/* {txHash && <ViewTransaction hash={txHash} status={status} />} */}
    </form>
  );
}
