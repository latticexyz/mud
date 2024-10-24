"use client";

import { Address, Hex } from "viem";
import { createStore } from "zustand/vanilla";
import { relayChannelName } from "./common";
import { debug } from "./debug";
import { Message, MessageType } from "./messages";

export type Write = {
  writeId: string;
  type: MessageType;
  hash?: Hex;
  from?: Address;
  address: Address;
  functionSignature: string;
  userOperationHash?: Hex; // TODO:
  args: unknown[];
  value?: bigint;
  time: number;
  events: Message<Exclude<MessageType, "ping">>[];
  error?: Error;
};

// TODO: improve ts
export type Send = {
  writeId: string;
  calls: {
    to: Address;
    functionSignature: string;
    args: unknown[];
  }[];

  type: MessageType;
  hash?: Hex;
  from?: Address;
  address: Address;
  functionSignature: string;
  userOperationHash?: Hex;
  args: unknown[];
  value?: bigint;
  time: number;
  events: Message<Exclude<MessageType, "ping">>[];
  error?: Error;
};

export type State = {
  writes: {
    [id: string]: Write;
  };
  sends: {
    [id: string]: Send;
  };
};

export const store = createStore<State>(() => ({
  writes: {},
  sends: {},
}));

debug("listening for relayed messages", relayChannelName);
const channel = new BroadcastChannel(relayChannelName);
channel.addEventListener("message", ({ data }: MessageEvent<Message>) => {
  if (data.type === "ping") return;
  store.setState((state) => {
    if (
      data.type === "send" ||
      data.type === "waitForUserOperationReceipt" ||
      data.type === "waitForUserOperationReceipt:result"
    ) {
      console.log("incoming send", data);

      const send = data.type === "send" ? ({ ...data, events: [] } satisfies Send) : state.sends[data.writeId];
      return {
        ...state,
        sends: {
          ...state.sends,
          [data.writeId]: {
            ...send,
            type: data.type,
            events: [...send.events, data],
          },
        },
      };
    } else {
      const write = data.type === "write" ? ({ ...data, events: [] } satisfies Write) : state.writes[data.writeId];
      return {
        ...state,
        writes: {
          ...state.writes,
          [data.writeId]: {
            ...write,
            type: data.type,
            hash: data.type === "waitForTransactionReceipt" ? data.hash : write.hash,
            events: [...write.events, data],
          },
        },
      };
    }
  });
});
