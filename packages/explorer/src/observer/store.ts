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
  args: unknown[];
  value?: bigint;
  time: number;
  events: Message<Exclude<MessageType, "ping">>[];
  error?: Error;
};

export type State = {
  writes: Write[];
};

export const store = createStore<State>(() => ({
  writes: [],
}));

debug("listening for relayed messages", relayChannelName);
const channel = new BroadcastChannel(relayChannelName);
channel.addEventListener("message", ({ data }: MessageEvent<Message>) => {
  if (data.type === "ping") return;
  store.setState((state) => {
    const writeIndex = state.writes.findIndex((w) => w.writeId === data.writeId);
    const write =
      writeIndex !== -1
        ? state.writes[writeIndex]
        : data.type === "write"
          ? ({ ...data, events: [] } satisfies Write)
          : undefined;

    if (!write) return state;

    const updatedWrite = {
      ...write,
      type: data.type,
      hash: data.type === "waitForTransactionReceipt" ? data.hash : write.hash,
      events: [...write.events, data],
    };

    const newWrites = [...state.writes];
    if (writeIndex !== -1) {
      newWrites.splice(writeIndex, 1);
      newWrites.unshift(updatedWrite);
    } else {
      newWrites.unshift(updatedWrite);
    }

    return {
      writes: newWrites,
    };
  });
});
