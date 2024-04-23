import { useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { ChainSelect } from "./ChainSelect";
import { AmountInput } from "./AmountInput";
import { Button } from "../../ui/Button";
import { useAppChain } from "../../useAppChain";

export const DEFAULT_DEPOSIT_AMOUNT = 0.005;

export type Props = {
  amount: bigint | undefined;
  setAmount: (amount: bigint | undefined) => void;
  // TODO: should we use UseWriteContractReturnType instead?
  onSubmit: () => void;
  disabled?: boolean;
  pending?: boolean;
  submitButtonLabel?: string;
};

export function DepositForm({ amount, setAmount, onSubmit, disabled, pending, submitButtonLabel = "Deposit" }: Props) {
  const chain = useAppChain();
  const [fundSourceChainId, setFundSourceChainId] = useState(chain.id);

  const { chainId } = useAccount();
  const shouldSwitchChain = chainId !== chain.id;
  const switchChain = useSwitchChain();

  return (
    <form
      className="flex flex-col px-5 gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex gap-2">
        <ChainSelect value={fundSourceChainId} onChange={setFundSourceChainId} />
        {/* <ChainDropdown /> */}
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
          onClick={() => switchChain.switchChain({ chainId: fundSourceChainId })}
        >
          Switch chain
        </Button>
      ) : (
        <Button type="submit" className="w-full" pending={pending} disabled={disabled}>
          {submitButtonLabel}
        </Button>
      )}

      {/* {txHash && <ViewTransaction hash={txHash} status={status} />} */}
    </form>
  );
}
