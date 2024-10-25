import { Address, Hash } from "viem";
import { UserOperationReceipt } from "viem/account-abstraction";
import { ReceiptSummary } from "./common";

export type UserOperationCall = {
  to: Address;
  functionSignature: string;
  functionName: string;
  args: unknown;
};

export type Messages = {
  ping: {};
  waitForUserOperationReceipt: {
    writeId: string;
    userOpHash: Hash;
  };
  "waitForUserOperationReceipt:result": UserOperationReceipt & {
    writeId: string;
  };
  write: {
    writeId: string;
    address?: Address; // TODO: was required before, handle it
    from: Address;

    // TODO: improve types
    functionSignature?: string;
    args?: unknown[];
    calls?: UserOperationCall[];

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
