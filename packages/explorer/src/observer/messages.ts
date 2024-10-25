import { Address, Hash, Log, TransactionReceipt } from "viem";
import { ReceiptSummary } from "./common";
import { UserOperation } from "./store";

export type Messages = {
  ping: {};
  waitForUserOperationReceipt: {
    writeId: string;
    userOpHash: Hash;
  };
  "waitForUserOperationReceipt:result": {
    writeId: string;
    receipt: TransactionReceipt;
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
  "waitForTransactionReceipt:result": {
    writeId: string;
    receipt: ReceiptSummary;
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
