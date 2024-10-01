"use client";

import { Address, Hex } from "viem";
import { createStore } from "zustand/vanilla";
import { relayChannelName } from "./common";
import { debug } from "./debug";
import { Message, MessageType } from "./messages";

export type Write = {
  writeId: string;
  hash?: Hex;
  address: Address;
  functionSignature: string;
  args: unknown[];
  time: number;
  events: Message<Exclude<MessageType, "ping">>[];
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
          events: [...write.events, data],
        },
      },
    };
  });
});
