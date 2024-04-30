import { DepositForm } from "./DepositForm";
import {
  useAccount,
  useBalance,
  useEstimateFeesPerGas,
  usePrepareTransactionRequest,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useAppAccountClient } from "../../useAppAccountClient";
import { type Props } from "./DepositMethodForm";
import { SubmitButton } from "./SubmitButton";

export function DepositViaTransferForm(props: Props) {
  const { data: appAccountClient } = useAppAccountClient();

  const { address: userAddress } = useAccount();
  const balance = useBalance({ chainId: props.sourceChain.id, address: userAddress });
  // We also separately get fees here, otherwise MetaMask complains with
  //   The method `eth_maxPriorityFeePerGas` does not exist / is not available
  // See https://github.com/wevm/wagmi/issues/3865 for details
  const fees = useEstimateFeesPerGas({ chainId: props.sourceChain.id });

  const prepared = usePrepareTransactionRequest(
    appAccountClient && balance.data && balance.data.value > (props.amount ?? 0n) && fees.data
      ? {
          chainId: props.sourceChain.id,
          to: appAccountClient.account.address,
          value: props.amount,
          maxPriorityFeePerGas: fees.data?.maxPriorityFeePerGas,
          query: {},
        }
      : {},
  );

  const sendTransaction = useSendTransaction({
    mutation: {
      onError: (error) => {
        console.log("Error when depositing via transfer", error);
      },
    },
  });
  const receipt = useWaitForTransactionReceipt({
    chainId: props.sourceChain.id,
    hash: sendTransaction.data,
  });

  // TODO: ideally this should pipe in a QueryResult for estimated fee/time and a MutationResult for sending the tx with Hex as its return type

  return (
    <DepositForm
      {...props}
      estimatedFee={{
        fee: prepared.data ? prepared.data.gas * prepared.data.maxFeePerGas : undefined,
        isLoading: prepared.isLoading,
        error: prepared.error ?? undefined,
      }}
      estimatedTime="Instant"
      submitButton={
        <SubmitButton
          chainId={props.sourceChain.id}
          disabled={!appAccountClient}
          pending={!prepared.data || sendTransaction.isPending || receipt.isLoading}
        >
          Deposit via transfer
        </SubmitButton>
      }
      onSubmit={async () => {
        // This shouldn't happen because the submit button is marked pending while this is missing.
        if (!prepared.data) throw new Error("Deposit transaction was not prepared.");

        console.log("sending deposit", prepared.data);
        await sendTransaction.sendTransactionAsync({
          ...prepared.data,
          // TS complains about the `to` type, even though it ran through `usePrepareTransactionRequest`
          to: prepared.data.to!,
        });
      }}
    />
  );
}
