import { DepositForm } from "./DepositForm";
import { usePrepareTransactionRequest, useSendTransaction } from "wagmi";
import { useAppAccountClient } from "../../useAppAccountClient";
import { type Props } from "./DepositMethodForm";

export function DepositViaTransferForm(props: Props) {
  const { data: appAccountClient } = useAppAccountClient();

  const prepared = usePrepareTransactionRequest(
    appAccountClient
      ? {
          chainId: props.sourceChain.id,
          to: appAccountClient.account.address,
          value: props.amount,
        }
      : {},
  );

  const sendTransaction = useSendTransaction();

  // TODO: ideally this should pipe in a QueryResult for estimated fee/time and a MutationResult for sending the tx with Hex as its return type

  return (
    <DepositForm
      {...props}
      estimatedFee={prepared.data ? prepared.data.gas * prepared.data.maxFeePerGas : undefined}
      estimatedTime={0}
      pending={sendTransaction.isPending}
      submitButtonLabel="Deposit via transfer"
      onSubmit={
        appAccountClient
          ? async () => {
              // TODO: I wanna pass in the prepared transaction here, but TS complains
              await sendTransaction.sendTransactionAsync({
                chainId: props.sourceChain.id,
                to: appAccountClient.account.address,
                value: props.amount,
              });
            }
          : undefined
      }
    />
  );
}
