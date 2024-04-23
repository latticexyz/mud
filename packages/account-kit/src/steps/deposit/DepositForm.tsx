import { useAccount, useSwitchChain } from "wagmi";
import { ChainSelect } from "./ChainSelect";
import { AmountInput } from "./AmountInput";
import { Button } from "../../ui/Button";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { useQueryClient } from "@tanstack/react-query";

export const DEFAULT_DEPOSIT_AMOUNT = 0.005;

export type Props = {
  sourceChainId: number;
  setSourceChainId: (chainId: number) => void;
  amount: bigint | undefined;
  setAmount: (amount: bigint | undefined) => void;
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
  onSubmit,
  disabled,
  pending,
  submitButtonLabel = "Deposit",
}: Props) {
  const { chainId: userChainId } = useAccount();
  const shouldSwitchChain = userChainId !== sourceChainId;
  const switchChain = useSwitchChain();
  const queryClient = useQueryClient();
  const { resetStep } = useOnboardingSteps();

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
