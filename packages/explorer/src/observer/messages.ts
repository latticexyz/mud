import { Address, Hash } from "viem";
import { ReceiptSummary } from "./common";

export type Messages = {
  ping: {};
  write: {
    writeId: string;
    address: Address;
    functionSignature: string;
    args: unknown[];
  };
  "write:result": PromiseSettledResult<Hash> & {
    writeId: string;
  };
  waitForTransactionReceipt: {
    writeId: string;
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
