import { Chain, encodeFunctionData } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { SubmitButton } from "./SubmitButton";
import { DepositForm } from "./DepositForm";
import { useDeposits } from "./useDeposits";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { BALANCE_SYSTEM_ABI, BALANCE_SYSTEM_ADDRESS, ETH_ADDRESS, publicClient } from "./DepositFormContainer";

type Props = {
  amount: bigint | undefined;
  setAmount: (amount: bigint | undefined) => void;
  sourceChain: Chain;
  setSourceChainId: (chainId: number) => void;
};

export function DepositViaNativeForm({ amount, setAmount, sourceChain, setSourceChainId }: Props) {
  const { chainId: destinationChainId } = useEntryKitConfig();
  const { address: userAddress } = useAccount();
  const { data: wallet } = useWalletClient();

  // TODO: show deposits loading state
  const { addDeposit } = useDeposits();

  const deposit = useMutation({
    mutationKey: ["deposit"],
    mutationFn: async () => {
      try {
        // const result = await relayClient?.actions.execute({
        //   quote,
        //   wallet: wallet!,
        //   onProgress: ({ steps, fees, breakdown, currentStep, currentStepItem, txHashes, details }) => {
        //     console.log("onProgress", { steps, fees, breakdown, currentStep, currentStepItem, txHashes, details });
        //   },
        // });

        return "hello";
      } catch (error) {
        console.error("Error while depositing via Relay", error);
        throw error;
      }
    },
  });

  // TODO: fetch fees
  const fee = {
    fee: 2n,
    isLoading: false,
    error: undefined,
  };
  return (
    <DepositForm
      sourceChain={sourceChain}
      setSourceChainId={setSourceChainId}
      amount={amount}
      setAmount={setAmount}
      estimatedFee={{
        fee: fee != null ? BigInt(fee.fee) : undefined,
        isLoading: fee.isLoading,
        error: fee.error instanceof Error ? fee.error : undefined,
      }}
      estimatedTime={"A few seconds"}
      onSubmit={async () => {
        await deposit.mutateAsync();
      }}
      submitButton={
        <SubmitButton
          variant="primary"
          chainId={sourceChain.id}
          // TODO: add disabled and pending
          // disabled={quote.isError || !amount}
          // pending={deposit.isPending}
        >
          Deposit
        </SubmitButton>
      }
    />
  );
}
