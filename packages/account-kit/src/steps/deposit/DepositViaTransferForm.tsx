import { DepositForm } from "./DepositForm";
import { useAccount, useBalance, usePrepareTransactionRequest, usePublicClient, useWalletClient } from "wagmi";
import { useAppAccountClient } from "../../useAppAccountClient";
import { type Props } from "./DepositMethodForm";
import { SubmitButton } from "./SubmitButton";
import { useMutation } from "@tanstack/react-query";
import { TransferDeposit, useDeposits } from "./useDeposits";
import { debug } from "../../debug";
import { Account, Chain, PrepareTransactionRequestReturnType, PublicClient, WalletClient } from "viem";

export function DepositViaTransferForm(props: Props) {
  const { data: appAccountClient } = useAppAccountClient();
  const { addDeposit } = useDeposits();
  const publicClient = usePublicClient({ chainId: props.sourceChain.id });
  const { data: walletClient } = useWalletClient({ chainId: props.sourceChain.id });

  const { address: userAddress } = useAccount();
  const balance = useBalance({ chainId: props.sourceChain.id, address: userAddress });

  const prepare = usePrepareTransactionRequest(
    appAccountClient && balance.data && balance.data.value > (props.amount ?? 0n)
      ? {
          chainId: props.sourceChain.id,
          to: appAccountClient.account.address,
          value: props.amount,
          query: {},
        }
      : {},
  );

  const deposit = useMutation({
    mutationKey: [
      "depositViaTransfer",
      props.sourceChain.id,
      appAccountClient?.account.address,
      props.amount?.toString(),
    ],
    mutationFn: async ({
      publicClient,
      walletClient,
      prepared,
    }: {
      publicClient: PublicClient;
      walletClient: WalletClient;
      prepared: PrepareTransactionRequestReturnType<Chain, Account, undefined, undefined>;
    }) => {
      try {
        const hash = await walletClient.sendTransaction(prepared);
        const receipt = publicClient.waitForTransactionReceipt({ hash }).then((receipt) => {
          if (receipt.status === "reverted") {
            throw new Error("Transfer transaction reverted.");
          }
          return receipt;
        });

        const pendingDeposit = {
          type: "transfer",
          amount: prepared.value!,
          chainL1Id: prepared.chainId,
          chainL2Id: prepared.chainId,
          hash,
          receipt,
          start: new Date(),
          estimatedTime: 1000 * 12,
          isComplete: receipt.then(() => undefined),
        } satisfies TransferDeposit;

        debug("bridge transaction submitted", pendingDeposit);
        addDeposit(pendingDeposit);
      } catch (error) {
        console.error("Error while depositing via bridge", error);
        throw error;
      }
    },
  });

  // TODO: ideally this should pipe in a QueryResult for estimated fee/time and a MutationResult for sending the tx with Hex as its return type

  return (
    <DepositForm
      {...props}
      estimatedFee={{
        fee: prepare.data ? prepare.data.gas * prepare.data.maxFeePerGas : undefined,
        isLoading: prepare.isLoading,
        error: prepare.error ?? undefined,
      }}
      estimatedTime="A few seconds"
      submitButton={
        <SubmitButton
          chainId={props.sourceChain.id}
          disabled={!appAccountClient}
          pending={!publicClient || !walletClient || !prepare.data?.to || deposit.isPending}
        >
          Deposit via transfer
        </SubmitButton>
      }
      onSubmit={async () => {
        // This shouldn't happen because the submit button is marked pending while this is missing.
        if (!publicClient) throw new Error("Could not deposit. Public client not ready.");
        if (!walletClient) throw new Error("Could not deposit. Wallet client not ready.");
        if (!prepare.data?.to) throw new Error("Could not deposit. Transaction not prepared.");

        await deposit.mutateAsync({ publicClient, walletClient, prepared: prepare.data });
      }}
    />
  );
}
