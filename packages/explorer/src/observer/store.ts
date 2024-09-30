"use client";

import { Address, Hash } from "viem";
import { createStore } from "zustand/vanilla";
import { relayChannelName } from "./common";
import { debug } from "./debug";
import { Message, MessageType } from "./messages";

export type Write = {
  writeId: string;
  address: Address;
  functionSignature: string;
  args: unknown[];
  hash?: Hash;
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
    const newWriteState = {
      ...write,
      hash: data.type === "waitForTransactionReceipt" ? data.hash : write.hash,
      events: [...write.events, data],
    };

    return {
      writes: {
        ...state.writes,
        [data.writeId]: newWriteState,
      },
    };
  });
});
