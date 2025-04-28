import { useState } from "react";
import { useChains, useChainId } from "wagmi";
import { DepositForm } from "./DepositForm";
import { ArrowLeftIcon } from "../../icons/ArrowLeftIcon";

type Props = {
  goBack: () => void;
};

export function DepositFormContainer({ goBack }: Props) {
  const chainId = useChainId();
  const chains = useChains();
  const [sourceChainId, setSourceChainId] = useState(chainId);
  const sourceChain = chains.find(({ id }) => id === sourceChainId)!;
  const [amount, setAmount] = useState<bigint | undefined>(undefined);

  return (
    <>
      {/* TODO: improve styling + make button */}
      <span className="p-1 cursor-pointer" onClick={goBack} aria-label="Back">
        <ArrowLeftIcon className="w-4 h-4" />
      </span>

      <div className="py-6">
        <DepositForm
          sourceChain={sourceChain}
          setSourceChainId={setSourceChainId}
          amount={amount}
          setAmount={setAmount}
          estimatedFee={{
            // fee: fee != null ? BigInt(fee) : undefined,
            // isLoading: quote.isLoading,
            // error: quote.error ?? undefined,

            fee: undefined,
            isLoading: false,
            error: undefined,
          }}
          estimatedTime="A few seconds"
          onSubmit={() => {}}
          // submitButton={<SubmitButton chainId={sourceChain.id} disabled={!amount} pending={false} />}
        />
      </div>
    </>
  );
}
