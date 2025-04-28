import { useState } from "react";
import { useChains, useChainId, useWalletClient } from "wagmi";
import { useQuery } from "wagmi/query";
import { DepositForm } from "./DepositForm";
import { ArrowLeftIcon } from "../../icons/ArrowLeftIcon";
import { useRelay } from "./useRelay";
import { pyrope } from "@latticexyz/common/chains";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";

type Props = {
  goBack: () => void;
};

export function DepositFormContainer({ goBack }: Props) {
  const chainId = useChainId();
  const chains = useChains();
  const { chainId: destinationChainId } = useEntryKitConfig();
  const [sourceChainId, setSourceChainId] = useState(chainId);
  const sourceChain = chains.find(({ id }) => id === sourceChainId)!;
  const [amount, setAmount] = useState<bigint | undefined>(undefined);

  const { data: wallet } = useWalletClient();
  const { data: relay } = useRelay();
  const relayClient = relay?.client;

  const quote = useQuery({
    // TODO: destination chain should be based on config
    queryKey: ["relayBridgeQuote", sourceChain.id, amount?.toString()],
    retry: 1,
    queryFn: async () => {
      const result = await relayClient?.actions.getQuote({
        chainId: sourceChain.id,
        toChainId: destinationChainId,
        currency: "0x0000000000000000000000000000000000000000",
        toCurrency: "0x0000000000000000000000000000000000000000",
        amount: amount?.toString(),
        tradeType: "EXACT_INPUT",
        wallet,
      });

      return result;
    },
    enabled: !!amount,
  });

  console.log("quote:", quote.data);

  const fee = quote.data?.fees?.gas?.amount; // TODO: calculate fee correctly
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
            fee: fee != null ? BigInt(fee) : undefined,
            isLoading: quote.isLoading,
            error: quote.error ?? undefined,
          }}
          estimatedTime="A few seconds"
          onSubmit={() => {}}
          // submitButton={<SubmitButton chainId={sourceChain.id} disabled={!amount} pending={false} />}
        />
      </div>
    </>
  );
}
