import { useAccount, useWriteContract, usePrepareTransactionRequest, usePublicClient } from "wagmi";
import { Chain, encodeFunctionData } from "viem";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DepositForm } from "./DepositForm";
import { SubmitButton } from "./SubmitButton";
import { BALANCE_SYSTEM_ABI } from "./DepositFormContainer";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { getPaymaster } from "../../getPaymaster";

type Props = {
  amount: bigint | undefined;
  setAmount: (amount: bigint | undefined) => void;
  sourceChain: Chain;
  setSourceChainId: (chainId: number) => void;
};

export function DepositViaNativeForm({ amount, setAmount, sourceChain, setSourceChainId }: Props) {
  const { chain } = useEntryKitConfig();
  const paymaster = getPaymaster(chain);
  const { address: userAddress } = useAccount();
  const { writeContractAsync: writeDepositTo } = useWriteContract();
  const publicClient = usePublicClient();

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
      abi: BALANCE_SYSTEM_ABI,
      functionName: "depositTo",
      args: [userAddress],
    }),
    value: amount,
  });

  const deposit = useMutation({
    mutationKey: ["depositViaNative", amount?.toString()],
    mutationFn: async () => {
      if (!amount || !userAddress || !paymaster?.address) return;

      const hash = await writeDepositTo({
        address: paymaster?.address,
        abi: BALANCE_SYSTEM_ABI,
        functionName: "depositTo",
        args: [userAddress],
        value: amount,
      });
      return { hash };
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
