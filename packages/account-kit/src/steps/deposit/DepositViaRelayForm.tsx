import { DepositForm } from "./DepositForm";
import { useSendTransaction } from "wagmi";
import { useAppAccountClient } from "../../useAppAccountClient";
import { type Props } from "./DepositMethodForm";
import { SubmitButton } from "./SubmitButton";

export function DepositViaRelayForm(props: Props) {
  const { data: appAccountClient } = useAppAccountClient();

  const sendTransaction = useSendTransaction();

  // TODO: ideally this should pipe in a QueryResult for estimated fee/time and a MutationResult for sending the tx with Hex as its return type

  return (
    <DepositForm
      {...props}
      estimatedFee={undefined}
      estimatedTime="A few minutes"
      submitButton={
        <SubmitButton chainId={props.sourceChain.id} disabled={!appAccountClient} pending={sendTransaction.isPending}>
          Deposit via Relay
        </SubmitButton>
      }
      onSubmit={async () => {
        // TODO: I wanna pass in the prepared transaction here, but TS complains
        await sendTransaction.sendTransactionAsync({
          chainId: props.sourceChain.id,
          to: appAccountClient!.account.address,
          value: props.amount,
        });
      }}
    />
  );
}
