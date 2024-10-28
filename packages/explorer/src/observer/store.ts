"use client";

import { Address, Hash } from "viem";
import { createStore } from "zustand/vanilla";
import { relayChannelName } from "./common";
import { debug } from "./debug";
import { DecodedUserOperationCall, Message, MessageType } from "./messages";

export type Write = {
  writeId: string;
  type: MessageType;
  hash?: Hash;
  userOpHash?: Hash;
  from: Address;
  time: number;
  calls: DecodedUserOperationCall[];
  events: Message<Exclude<MessageType, "ping">>[];
  error?: Error;
};

export type State = {
  writes: {
    [id: string]: Write;
  };
};

export const store = createStore<State>(() => ({
  writes: {},
}));

debug("listening for relayed messages", relayChannelName);
const channel = new BroadcastChannel(relayChannelName);
channel.addEventListener("message", ({ data }: MessageEvent<Message>) => {
  if (data.type === "ping") return;
  store.setState((state) => {
    const write = data.type === "write" ? ({ ...data, events: [] } satisfies Write) : state.writes[data.writeId];
    if (!write) return state;

    let hash = write.hash;
    if (data.type === "waitForTransactionReceipt") {
      hash = data.hash;
    } else if (data.type === "waitForUserOperationReceipt:result") {
      hash = data.receipt.transactionHash;
    }

    return {
      ...state,
      writes: {
        ...state.writes,
        [data.writeId]: {
          ...write,
          type: data.type,
          hash,
          userOpHash: data.type === "waitForUserOperationReceipt" ? data.userOpHash : write.userOpHash,
          events: [...write.events, data],
        },
      },
    };
  });
});
