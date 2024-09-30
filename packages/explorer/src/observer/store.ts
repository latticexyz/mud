"use client";

import { Address, Hash } from "viem";
import { createStore } from "zustand/vanilla";
import { WatchedTransaction } from "../app/(explorer)/[chainName]/worlds/[worldAddress]/observe/TransactionsTableContainer";
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
  // TODO: keep it here?
  transactions: WatchedTransaction[];

  updateWrite: (data: Message<MessageType>) => void;
};

export const store = createStore<State>(() => ({
  finalTransactions: [],
  transactions: [],
  writes: {},

  updateWrite: (data: Message<MessageType>) => {
    if (data.type === "ping") return;

    console.log("updateWrite:", data);

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
  },
}));

debug("listening for relayed messages", relayChannelName);

const channel = new BroadcastChannel(relayChannelName);
channel.addEventListener("message", ({ data }: MessageEvent<Message>) => {
  store.getState().updateWrite(data);
});
