import { TransactionReceiptNotFoundErrorType } from "viem";

type PartialViemError = Partial<TransactionReceiptNotFoundErrorType>;

export function isViemTransactionReceiptNotFoundError(error: unknown): error is Error & PartialViemError {
  if (!(error instanceof Error)) {
    return false;
  }

  const maybeTransactionReceiptNotFoundErrorType = error as PartialViemError;

  return (
    maybeTransactionReceiptNotFoundErrorType.name === "TransactionReceiptNotFoundError" &&
    !!maybeTransactionReceiptNotFoundErrorType.version?.match(/Version: viem@\d+\.\d+\.\d+/gi)
  );
}
