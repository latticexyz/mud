import { Hex } from "viem";
import { ReceiptSummary } from "./common";

export type Messages = {
  ping: null;
  write: {
    writeId: string;
    address: Hex;
    functionSignature: string;
    args: unknown[];
  };
  "write:result": PromiseSettledResult<Hex> & {
    writeId: string;
  };
  waitForTransactionReceipt: {
    writeId: string;
  };
  "waitForTransactionReceipt:result": PromiseSettledResult<ReceiptSummary> & {
    writeId: string;
  };
  waitForStateChange: {
    writeId: string;
  };
  "waitForStateChange:result": PromiseSettledResult<ReceiptSummary> & {
    writeId: string;
  };
};

export type MessageType = keyof Messages;

export type EmitMessage = <const messageType extends MessageType>(
  type: messageType,
  data: Messages[messageType],
) => void;
