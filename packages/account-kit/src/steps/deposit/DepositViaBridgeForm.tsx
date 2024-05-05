import { DepositForm } from "./DepositForm";
import { useAccount, useBalance, useEstimateFeesPerGas, usePublicClient, useWalletClient } from "wagmi";
import { useAppAccountClient } from "../../useAppAccountClient";
import { type Props } from "./DepositMethodForm";
import { useAppChain } from "../../useAppChain";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getL2TransactionHashes, publicActionsL1, publicActionsL2, walletActionsL1 } from "viem/op-stack";
import { SubmitButton } from "./SubmitButton";
import { Account, Chain } from "viem";
import { debug } from "../../debug";
import { BridgeDeposit, useDeposits } from "./useDeposits";

export function DepositViaBridgeForm(props: Props) {
  const appChain = useAppChain();
  const { addDeposit } = useDeposits();

  const { data: appAccountClient } = useAppAccountClient();
  const appAccountAddress = appAccountClient?.account.address;

  const { address: userAddress } = useAccount();
  const balance = useBalance({ chainId: props.sourceChain.id, address: userAddress });
  const hasMinimumBalance = balance.data ? balance.data.value > (props.amount ?? 0n) : null;

  const walletClientL1 = useWalletClient({ chainId: props.sourceChain.id }).data?.extend(walletActionsL1());
  const publicClientL1 = usePublicClient({ chainId: props.sourceChain.id })?.extend(publicActionsL1());
  const publicClientL2 = usePublicClient({ chainId: appChain.id })?.extend(publicActionsL2());

  const prepareQueryKey = [
    "prepareDepositViaBridge",
    publicClientL2?.uid,
    balance.data?.value.toString(),
    props.amount?.toString(),
    appAccountAddress,
  ];

  const prepare = useQuery({
    queryKey: prepareQueryKey,
    enabled: !!(publicClientL2 && props.amount && hasMinimumBalance && appAccountAddress),
    queryFn: () =>
      publicClientL2!.buildDepositTransaction<Chain, Account>({
        mint: props.amount!,
        to: appAccountAddress,
      }),
  });

  const estimateFee = useEstimateFeesPerGas({ chainId: props.sourceChain.id });
  const estimateGas = useQuery({
    queryKey: ["estimateDepositViaBridge", prepareQueryKey, prepare.status, publicClientL1?.uid],
    enabled: !!(publicClientL1 && prepare.data),
    queryFn: () => publicClientL1!.estimateDepositTransactionGas(prepare.data!),
  });

  const deposit = useMutation({
    mutationKey: [
      "depositViaBridge",
      prepareQueryKey,
      prepare.status,
      walletClientL1?.uid,
      publicClientL1?.uid,
      publicClientL2?.uid,
    ],
    mutationFn: async () => {
      try {
        // TODO: take these in as args instead?
        if (!walletClientL1) throw new Error("Could not deposit. L1 wallet client not ready.");
        if (!publicClientL1) throw new Error("Could not deposit. L1 public client not ready.");
        if (!publicClientL2) throw new Error("Could not deposit. L2 public client not ready.");
        if (!prepare.data) throw new Error("Could not deposit. Transaction not prepared.");
        const hashL1 = await walletClientL1.depositTransaction(prepare.data);

        const receiptL1 = publicClientL1.waitForTransactionReceipt({ hash: hashL1 }).then((receipt) => {
          if (receipt.status === "reverted") {
            throw new Error("L1 deposit transaction reverted.");
          }
          const hashL2 = getL2TransactionHashes(receipt).at(0);
          if (!hashL2) {
            console.error("Could not find L2 hash in L1 deposit transaction receipt.", receipt);
            throw new Error("Could not find L2 hash in L1 deposit transaction receipt.");
          }
          return {
            receiptL1: receipt,
            hashL2,
          };
        });

        const receiptL2 = receiptL1.then(async ({ hashL2 }) => {
          const receipt = await publicClientL2.waitForTransactionReceipt({ hash: hashL2 });
          if (receipt.status === "reverted") {
            // I really really hope this never happens.
            throw new Error("L2 bridge deposit transaction reverted.");
          }
          return receipt;
        });

        const pendingDeposit = {
          type: "bridge",
          amount: prepare.data.request.mint!,
          chainL1Id: props.sourceChain.id,
          chainL2Id: appChain.id,
          hashL1,
          receiptL1,
          receiptL2,
          start: new Date(),
          estimatedTime: 1000 * 60 * 3,
          isComplete: receiptL2.then(() => undefined),
        } satisfies BridgeDeposit;

        debug("bridge transaction submitted", pendingDeposit);
        addDeposit(pendingDeposit);
      } catch (error) {
        console.error("Error while depositing via bridge", error);
        throw error;
      }
    },
  });

  return (
    <DepositForm
      {...props}
      estimatedFee={{
        fee: estimateGas.data && estimateFee.data ? estimateGas.data * estimateFee.data.maxFeePerGas : undefined,
        isLoading: estimateGas.isLoading || estimateFee.isLoading,
        error: estimateGas.error ?? estimateFee.error ?? undefined,
      }}
      estimatedTime="A few minutes"
      submitButton={
        <SubmitButton
          chainId={props.sourceChain.id}
          disabled={prepare.isError}
          pending={prepare.isLoading || deposit.isPending}
        >
          Deposit via bridge
        </SubmitButton>
      }
      onSubmit={async () => {
        await deposit.mutateAsync();
      }}
    />
  );
}
