import { Chain, encodeFunctionData } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Execute } from "@reservoir0x/relay-sdk";
import { SubmitButton } from "./SubmitButton";
import { DepositForm } from "./DepositForm";
import { useRelay } from "./useRelay";
import { useDeposits } from "./useDeposits";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { ETH_ADDRESS } from "./DepositFormContainer";
import { getPaymaster } from "../../getPaymaster";
import { paymasterAbi } from "../../quarry/common";

type Props = {
  amount: bigint | undefined;
  setAmount: (amount: bigint | undefined) => void;
  sourceChain: Chain;
  setSourceChainId: (chainId: number) => void;
};

export function DepositViaRelayForm({ amount, setAmount, sourceChain, setSourceChainId }: Props) {
  const { chain, chainId: destinationChainId } = useEntryKitConfig();
  const paymaster = getPaymaster(chain);
  const { data: wallet } = useWalletClient();
  const { address: userAddress } = useAccount();
  const { data: relay } = useRelay();
  const relayClient = relay?.client;

  // TODO: show deposits loading state
  const { addDeposit } = useDeposits();

  // TODO: get solver capacity for `user.maxBridgeAmount`
  const quote = useQuery<Execute>({
    queryKey: ["relayBridgeQuote", sourceChain.id, amount?.toString()],
    retry: 1,
    queryFn: async () => {
      if (!relayClient) throw new Error("No Relay client found.");
      if (!userAddress) throw new Error("No user address found.");

      const result = await relayClient.actions.getQuote({
        chainId: sourceChain.id,
        toChainId: destinationChainId,
        currency: ETH_ADDRESS,
        toCurrency: ETH_ADDRESS,
        amount: amount?.toString(),
        tradeType: "EXACT_OUTPUT",
        recipient: paymaster?.address,
        wallet,
        txs: [
          {
            to: paymaster?.address,
            data: encodeFunctionData({
              abi: paymasterAbi,
              functionName: "depositTo",
              args: [userAddress],
            }),
            value: amount?.toString(),
          },
        ],
      });

      if (!result) {
        throw new Error("Failed to get relay quote");
      }

      return result as Execute;
    },
    refetchInterval: 15000,
    enabled: !!amount && !!userAddress && !!relayClient,
  });

  const deposit = useMutation({
    mutationKey: ["depositViaRelay", sourceChain.id, amount?.toString()],
    mutationFn: async (quote: Execute) => {
      try {
        const result = await relayClient?.actions.execute({
          quote,
          wallet: wallet!,
          onProgress: ({ steps, fees, breakdown, currentStep, currentStepItem, txHashes, details }) => {
            console.log("onProgress", { steps, fees, breakdown, currentStep, currentStepItem, txHashes, details });
          },
        });

        return result;
      } catch (error) {
        console.error("Error while depositing via Relay", error);
        throw error;
      }
    },
  });

  const fee = quote.data?.fees?.gas?.amount;
  return (
    <DepositForm
      sourceChain={sourceChain}
      setSourceChainId={setSourceChainId}
      amount={amount}
      setAmount={setAmount}
      estimatedFee={{
        fee: fee != null ? BigInt(fee) : undefined,
        isLoading: quote.isLoading,
        error: quote.error instanceof Error ? quote.error : undefined,
      }}
      estimatedTime={"A few seconds"}
      onSubmit={async () => {
        if (!quote.data) return;
        await deposit.mutateAsync(quote.data);
      }}
      submitButton={
        <SubmitButton
          variant="primary"
          chainId={sourceChain.id}
          amount={amount}
          disabled={quote.isError || !amount}
          pending={deposit.isPending}
        >
          Deposit
        </SubmitButton>
      }
    />
  );
}
