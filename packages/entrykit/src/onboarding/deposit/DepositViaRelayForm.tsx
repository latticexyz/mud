import { Chain, encodeFunctionData } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Execute } from "@reservoir0x/relay-sdk";
import { SubmitButton } from "./SubmitButton";
import { DepositForm } from "./DepositForm";
import { useRelay } from "./useRelay";
import { useDeposits } from "./useDeposits";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { getPaymaster } from "../../getPaymaster";
import { paymasterAbi } from "../../quarry/common";

const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";

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
  const { addDeposit } = useDeposits();
  const { data: relay } = useRelay();
  const relayClient = relay?.client;

  const quote = useQuery<Execute>({
    queryKey: ["relayBridgeQuote", sourceChain.id, amount?.toString()],
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
    retry: 1,
    refetchInterval: 15_000,
    enabled: !!amount && !!userAddress && !!relayClient,
  });

  console.log("quote:", quote.data, quote.error);

  const deposit = useMutation({
    mutationKey: ["depositViaRelay", sourceChain.id, amount?.toString()],
    mutationFn: async (quote: Execute) => {
      if (!relayClient) throw new Error("No Relay client found.");
      if (!wallet) throw new Error("No wallet found.");

      try {
        return new Promise((resolve) => {
          const pendingDeposit = relayClient.actions.execute({
            quote,
            wallet,
            onProgress(progress) {
              const currentStep = progress.currentStep;
              const currentState = currentStep?.items[0]?.progressState;

              if (currentState === "validating") {
                addDeposit({
                  type: "relay",
                  requestId: currentStep?.requestId,
                  amount,
                  chainL1Id: sourceChain.id,
                  chainL2Id: destinationChainId,
                  start: new Date(),
                  estimatedTime: 1000 * 30,
                  depositPromise: pendingDeposit,
                  isComplete: pendingDeposit.then(() => undefined),
                });
                resolve(undefined);
              }
            },
          });
        });
      } catch (error) {
        console.error("Error while depositing via Relay", error);
        throw error;
      }
    },
  });

  const fees = quote.data?.fees;
  const gasFee = BigInt(fees?.gas?.amount ?? 0);
  const relayerFee = BigInt(fees?.relayer?.amount ?? 0);
  const fee = gasFee + relayerFee;
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
          amount={amount}
          chainId={sourceChain.id}
          disabled={quote.isError || !amount}
          pending={deposit.isPending}
        >
          Deposit
        </SubmitButton>
      }
    />
  );
}
