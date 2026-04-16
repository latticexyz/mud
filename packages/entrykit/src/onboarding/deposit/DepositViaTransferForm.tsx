import { useAccount, useWriteContract, usePrepareTransactionRequest, usePublicClient } from "wagmi";
import { Chain, encodeFunctionData } from "viem";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DepositForm } from "./DepositForm";
import { SubmitButton } from "./SubmitButton";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { getPaymaster } from "../../getPaymaster";
import { paymasterAbi } from "../../quarry/common";
import { TransferDeposit, useDeposits } from "./useDeposits";

type Props = {
  amount: bigint | undefined;
  setAmount: (amount: bigint | undefined) => void;
  sourceChain: Chain;
  setSourceChainId: (chainId: number) => void;
};

export function DepositViaTransferForm({ amount, setAmount, sourceChain, setSourceChainId }: Props) {
  const { chain } = useEntryKitConfig();
  const paymaster = getPaymaster(chain);
  const publicClient = usePublicClient();
  const { address: userAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { addDeposit } = useDeposits();

  if (!userAddress) {
    throw new Error("User address not found");
  }

  const { data: gasPrice } = useQuery({
    queryKey: ["gasPrice", sourceChain.id],
    queryFn: async () => {
      if (!publicClient) throw new Error("Public client not available");
      return publicClient.getGasPrice();
    },
    refetchInterval: 15000,
    enabled: !!publicClient,
  });

  const { data: prepareData, error: prepareError } = usePrepareTransactionRequest({
    to: paymaster?.address,
    data: encodeFunctionData({
      abi: paymasterAbi,
      functionName: "depositTo",
      args: [userAddress],
    }),
    value: amount,
  });

  const deposit = useMutation({
    mutationKey: ["depositViaTransfer", amount?.toString()],
    mutationFn: async () => {
      if (!paymaster) throw new Error("Paymaster not found");
      if (!publicClient) throw new Error("Public client not found");
      if (!amount) throw new Error("Amount cannot be 0");

      try {
        const hash = await writeContractAsync({
          address: paymaster.address,
          abi: paymasterAbi,
          functionName: "depositTo",
          args: [userAddress],
          value: amount,
        });

        const receipt = publicClient.waitForTransactionReceipt({ hash }).then((receipt) => {
          if (receipt.status === "reverted") {
            throw new Error("Transfer transaction reverted.");
          }
          return receipt;
        });

        const pendingDeposit = {
          type: "transfer",
          amount,
          chainL1Id: sourceChain.id,
          chainL2Id: chain.id,
          hash,
          receipt,
          start: new Date(),
          estimatedTime: 1000 * 12,
          isComplete: receipt.then(() => undefined),
        } satisfies TransferDeposit;

        addDeposit(pendingDeposit);
      } catch (error) {
        console.error("Error while depositing via bridge", error);
        throw error;
      }
    },
  });

  const estimatedFee = prepareData?.gas && gasPrice ? prepareData.gas * gasPrice : undefined;
  return (
    <DepositForm
      sourceChain={sourceChain}
      setSourceChainId={setSourceChainId}
      amount={amount}
      setAmount={setAmount}
      estimatedFee={{
        fee: estimatedFee,
        isLoading: (!prepareData && !prepareError) || !gasPrice,
        error: prepareError instanceof Error ? prepareError : undefined,
      }}
      estimatedTime="A few seconds"
      onSubmit={async () => {
        await deposit.mutateAsync();
      }}
      submitButton={
        <SubmitButton
          variant="primary"
          amount={amount}
          chainId={sourceChain.id}
          disabled={!!prepareError || !amount || !userAddress}
          pending={deposit.isPending}
        >
          Deposit
        </SubmitButton>
      }
    />
  );
}
