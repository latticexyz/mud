import { DepositForm } from "./DepositForm";
import { useAccount, useBalance, useEstimateFeesPerGas, usePublicClient, useWalletClient } from "wagmi";
import { useAppAccountClient } from "../../useAppAccountClient";
import { type Props } from "./DepositMethodForm";
import { useAppChain } from "../../useAppChain";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getL2TransactionHashes, publicActionsL1, publicActionsL2, walletActionsL1 } from "viem/op-stack";
import { BridgeTransactionStatus } from "./BridgeTransactionStatus";
import { SubmitButton } from "./SubmitButton";
import { Account, Chain } from "viem";
import { createStore } from "zustand/vanilla";
import { BridgeTransaction } from "./common";
import { useStore } from "zustand";
import { debug } from "../../debug";

// TODO: lift this into a generic deposit txs
const store = createStore<{
  readonly bridgeTransactions: readonly BridgeTransaction[];
}>(() => ({
  bridgeTransactions: [
    // TODO: remove this test tx
    // {
    //   amount: parseEther("0.01"),
    //   chainL1: holesky,
    //   chainL2: garnet,
    //   hashL1: "0x8f0987b82756f2e7df50fcbb302693e21aea823e0afac312c91fff052ce259d8",
    //   receiptL1: wait(5_000).then(() => ({}) as never),
    //   receiptL2: wait(15_000).then(() => ({}) as never),
    //   start: new Date(),
    //   estimatedTime: 1000 * 60 * 3,
    // },
  ],
}));

export function DepositViaBridgeForm(props: Props) {
  const appChain = useAppChain();
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

      const bridgeTransaction = {
        amount: prepare.data.request.mint!,
        chainL1: props.sourceChain,
        chainL2: appChain,
        hashL1,
        receiptL1,
        receiptL2,
        start: new Date(),
        estimatedTime: 1000 * 60 * 3,
      } satisfies BridgeTransaction;

      debug("bridge transaction submitted", bridgeTransaction);

      store.setState((state) => ({
        bridgeTransactions: [...state.bridgeTransactions, bridgeTransaction],
      }));

      // TODO: remove bridge transaction from state?
    },
  });

  const bridgeTransactions = useStore(store, (state) => state.bridgeTransactions);

  return (
    <DepositForm
      {...props}
      estimatedFee={{
        fee: estimateGas.data && estimateFee.data ? estimateGas.data * estimateFee.data.maxFeePerGas : undefined,
        isLoading: estimateGas.isLoading || estimateFee.isLoading,
      }}
      estimatedTime="A few minutes"
      // TODO: figure out some better way to bubble this up to advance to next step
      isComplete={deposit.isSuccess}
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
      // TODO: wrap these to control spacing between?
      transactionStatus={
        bridgeTransactions.length > 0 ? (
          <div className="flex flex-col gap-2">
            {bridgeTransactions.map((bridgeTransaction) => (
              <BridgeTransactionStatus key={bridgeTransaction.hashL1} {...bridgeTransaction} />
            ))}
          </div>
        ) : undefined
      }
    />
  );
}
