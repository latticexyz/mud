import { TransactionReceipt } from "viem";

export type ReceiptSummary = Pick<TransactionReceipt, "blockNumber" | "status" | "transactionHash">;
