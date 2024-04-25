import { PendingIcon } from "../../icons/PendingIcon";
import { UseWaitForTransactionReceiptReturnType } from "wagmi";

export type Props = {
  receiptL1: UseWaitForTransactionReceiptReturnType;
  receiptL2: UseWaitForTransactionReceiptReturnType;
};

export function BridgePendingTransactions({ receiptL1, receiptL2 }: Props) {
  if (receiptL1.isLoading) {
    return (
      <div>
        <PendingIcon />
      </div>
    );
  }

  if (receiptL1.isError) {
    return (
      <div>
        <PendingIcon />
      </div>
    );
  }

  return <></>;
}
