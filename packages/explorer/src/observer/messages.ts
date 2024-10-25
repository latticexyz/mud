import { Address, Hash, Log, TransactionReceipt } from "viem";
import { ReceiptSummary } from "./common";
import { UserOperation } from "./store";

export type Messages = {
  ping: {};
  waitForUserOperationReceipt: {
    writeId: string;
    userOpHash: Hash;
  };
  "waitForUserOperationReceipt:result": PromiseSettledResult<{
    actualGasCost: bigint;
    actualGasUsed: bigint;
    entryPoint: Address;
    logs: Log<bigint, number, false>[];
    nonce: bigint;
    paymaster?: Address | undefined;
    reason?: string | undefined;
    receipt: TransactionReceipt<bigint, number, "success" | "reverted">;
    sender: Address;
    success: boolean;
    userOpHash: Hash;
    // TODO: improve ts
  }> & {
    writeId: string;
  };
  write: {
    writeId: string;
    address?: Address; // TODO: was required before, handle it
    from: Address;

    // TODO: improve types
    functionSignature?: string;
    args?: unknown[];
    calls?: UserOperation["calls"];

    value?: bigint;
  };
  "write:result": PromiseSettledResult<Hash> & { writeId: string };
  waitForTransactionReceipt: {
    writeId: string;
    hash: Hash;
  };
  "waitForTransactionReceipt:result": PromiseSettledResult<ReceiptSummary> & {
    writeId: string;
  };
  waitForTransaction: {
    writeId: string;
  };
  "waitForTransaction:result": PromiseSettledResult<ReceiptSummary> & {
    writeId: string;
  };
};

export type MessageType = keyof Messages;
export type Message<messageType extends MessageType = MessageType> = {
  [k in MessageType]: Omit<Messages[k], "type" | "time"> & { type: k; time: number };
}[messageType];

export type EmitMessage = <const messageType extends MessageType>(
  type: messageType,
  data: Messages[messageType],
) => void;
