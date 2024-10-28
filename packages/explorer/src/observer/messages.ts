import { Address, Hash } from "viem";
import { UserOperationReceipt } from "viem/account-abstraction";
import { ReceiptSummary } from "./common";

// TODO: fix type, move elsewhere
export type DecodedUserOperationCall = {
  to?: Address;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
};

export type Messages = {
  ping: {};
  waitForUserOperationReceipt: {
    writeId: string;
    userOpHash: Hash;
  };
  write: {
    writeId: string;
    from: Address;
    calls: DecodedUserOperationCall[];
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
  "waitForUserOperationReceipt:result": UserOperationReceipt & {
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
