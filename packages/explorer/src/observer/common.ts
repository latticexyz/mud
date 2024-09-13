import { TransactionReceipt } from "viem";

export const relayChannelName = "explorer/observer";

export type ReceiptSummary = Pick<TransactionReceipt, "blockNumber" | "status" | "transactionHash">;
