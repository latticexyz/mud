"use client";

import { Address, Hash } from "viem";
import { createStore } from "zustand/vanilla";
import { relayChannelName } from "./common";
import { debug } from "./debug";
import { Message, MessageType } from "./messages";

// TODO: name better
export type RegularTranasction = {
  address: Address;
  functionSignature: string;
  calls?: never;
};

export type UserOperation = {
  functionSignature?: never;
  calls: {
    to: Address;
    functionSignature: string;
    functionName: string;
    args: unknown[];
  }[];
};

export type Write = {
  writeId: string;
  type: MessageType;
  hash?: Hash;
  userOpHash?: Hash;
  from: Address;
  time: number;
  value?: bigint;
  events: Message<Exclude<MessageType, "ping">>[];
  error?: Error;
} & (RegularTranasction | UserOperation);

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
    return {
      ...state,
      writes: {
        ...state.writes,
        [data.writeId]: {
          ...write,
          type: data.type,
          hash: data.type === "waitForTransactionReceipt" ? data.hash : write.hash,
          userOpHash: data.type === "waitForUserOperationReceipt" ? data.userOpHash : write.userOpHash,
          events: [...write.events, data],
        },
      },
    };
  });
});
