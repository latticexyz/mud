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
    return {
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
  });
});
