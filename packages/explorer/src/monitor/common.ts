import { TransactionReceipt } from "viem";

export const relayChannelName = "explorer/monitor";

export type ReceiptSummary = Pick<TransactionReceipt, "blockNumber" | "status" | "transactionHash">;
