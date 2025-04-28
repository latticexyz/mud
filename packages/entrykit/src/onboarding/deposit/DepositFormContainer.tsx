import { useState } from "react";
import { DepositForm } from "./DepositForm";
import { SourceChain } from "./common";
import { ArrowLeftIcon } from "../../icons/ArrowLeftIcon";
import { pyrope } from "@latticexyz/common/chains";

type Props = {
  goBack: () => void;
};

export function DepositFormContainer({ goBack }: Props) {
  const [amount, setAmount] = useState<bigint | undefined>(undefined);
  const [sourceChainId, setSourceChainId] = useState<SourceChain>(pyrope.id);
  const sourceChain = pyrope;

  return (
    <>
      {/* TODO: improve styling + make button */}
      <span className="p-1 cursor-pointer" onClick={goBack} aria-label="Back">
        <ArrowLeftIcon className="w-4 h-4" />
      </span>

      <div className="py-6">
        <DepositForm
          sourceChain={sourceChain}
          setSourceChainId={() => {}}
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
