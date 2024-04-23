import { DepositForm, type Props as DepositFormProps } from "../DepositForm";
import { usePrepareTransactionRequest, useSendTransaction } from "wagmi";
import { useAppAccountClient } from "../../../useAppAccountClient";

export type Props = Pick<DepositFormProps, "sourceChainId" | "setSourceChainId" | "amount" | "setAmount">;

export function DepositViaTransferForm(props: Props) {
  const { data: appAccountClient } = useAppAccountClient();
  console.log("chainId", props.sourceChainId);
  console.log("appAccountClient", appAccountClient?.account.address);
  console.log("value", props.amount);

  const prepared = usePrepareTransactionRequest(
    appAccountClient
      ? {
          chainId: props.sourceChainId,
          to: appAccountClient.account.address,
          value: props.amount,
        }
      : {},
  );

  console.log("prepared", prepared);
  const sendTransaction = useSendTransaction();

  return (
    <DepositForm
      {...props}
      estimatedFee={prepared.data ? prepared.data.gas * prepared.data.maxFeePerGas : undefined}
      estimatedTime={0}
      pending={sendTransaction.isPending}
      onSubmit={
        appAccountClient
          ? async () => {
              // TODO: I wanna pass in the prepared transaction here, but TS complains
              await sendTransaction.sendTransactionAsync({
                chainId: props.sourceChainId,
                to: appAccountClient.account.address,
                value: props.amount,
              });
            }
          : undefined
      }
    />
  );
}
