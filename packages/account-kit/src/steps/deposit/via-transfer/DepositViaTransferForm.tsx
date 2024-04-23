import { DepositForm, type Props as DepositFormProps } from "../DepositForm";
import { useSendTransaction } from "wagmi";
import { useAppAccountClient } from "../../../useAppAccountClient";

export type Props = Pick<DepositFormProps, "sourceChainId" | "setSourceChainId" | "amount" | "setAmount">;

export function DepositViaTransferForm(props: Props) {
  const { data: appAccountClient } = useAppAccountClient();
  const sendTransaction = useSendTransaction();

  return (
    <DepositForm
      {...props}
      pending={sendTransaction.isPending}
      onSubmit={
        appAccountClient
          ? async () => {
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
