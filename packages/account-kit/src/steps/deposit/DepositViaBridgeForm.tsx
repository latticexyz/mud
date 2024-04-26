import { DepositForm } from "./DepositForm";
import {
  useEstimateGas,
  usePublicClient,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import { useAppAccountClient } from "../../useAppAccountClient";
import { type Props } from "./DepositMethodForm";
import { portal2Abi } from "./abis";
import { useAppChain } from "../../useAppChain";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getL2TransactionHashes, publicActionsL1, publicActionsL2, walletActionsL1 } from "viem/op-stack";
import { BridgePendingTransactions } from "./BridgePendingTransactions";
import { SubmitButton } from "./SubmitButton";

export function DepositViaBridgeForm(props: Props) {
  const appChain = useAppChain();
  const { data: appAccountClient } = useAppAccountClient();
  const appAccountAddress = appAccountClient?.account.address;

  const walletClientL1 = useWalletClient({ chainId: props.sourceChain.id }).data?.extend(walletActionsL1());
  const publicClientL2 = usePublicClient({ chainId: appChain.id })?.extend(publicActionsL2());

  const prepareQueryKey = ["prepareDepositViaBridge", publicClientL2?.uid, props.amount?.toString(), appAccountAddress];
  const prepare = useQuery({
    queryKey: prepareQueryKey,
    enabled: !!(publicClientL2 && props.amount && appAccountAddress),
    queryFn: () =>
      publicClientL2!.buildDepositTransaction({
        mint: props.amount!,
        to: appAccountAddress,
      }),
  });

  const deposit = useMutation({
    mutationKey: ["depositViaBridge", prepareQueryKey, prepare.status, walletClientL1?.uid],
    mutationFn: async () => {
      // TODO: take these in as args instead?
      if (!walletClientL1) throw new Error("Could not deposit. L1 wallet client not ready.");
      if (!prepare.data) throw new Error("Could not deposit. Transaction not prepared.");
      return walletClientL1.depositTransaction(prepare.data);
    },
  });

  // console.log("prepare", prepare);

  // TODO: estimate

  const receiptL1 = useWaitForTransactionReceipt({
    chainId: props.sourceChain.id,
    hash: deposit.data,
  });

  const receiptL2 = useWaitForTransactionReceipt({
    chainId: appChain.id,
    hash: receiptL1.data ? getL2TransactionHashes(receiptL1.data)[0] : undefined,
  });

  // console.log("deposit", deposit.isPending, deposit.isPaused, deposit.isIdle);

  return (
    <DepositForm
      {...props}
      estimatedFee={undefined}
      estimatedTime={undefined}
      // TODO: figure out some better way to bubble this up to advance to next step
      isComplete={deposit.isSuccess && receiptL1.isSuccess && receiptL2.isSuccess}
      submitButton={
        // TODO: disable when prepare fails
        <SubmitButton
          sourceChainId={props.sourceChain.id}
          disabled={prepare.isError}
          pending={prepare.isLoading || deposit.isPending || receiptL1.isLoading || receiptL2.isLoading}
        >
          Deposit via bridge
        </SubmitButton>
      }
      onSubmit={async () => {
        await deposit.mutateAsync();
      }}
      transactionStatus={<BridgePendingTransactions receiptL1={receiptL1} receiptL2={receiptL2} />}
    />
  );
}
