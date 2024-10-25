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
  address: Address; // TODO: could be different for each call
  functionSignature: string; // TODO: optional
  args: unknown[]; // TODO: optional
  value?: bigint;
  time: number;
  events: Message<Exclude<MessageType, "ping">>[];
  error?: Error;
  clientType?: unknown; // TODO: double-check
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
    return {
      ...state,
      writes: {
        ...state.writes,
        [data.writeId]: {
          ...write,
          type: data.type,
          hash:
            data.type === "waitForTransactionReceipt" || data.type === "waitForUserOperationReceipt:result"
              ? data.hash
              : write.hash,
          receipt:
            data.type === "waitForTransactionReceipt:result" || data.type === "waitForUserOperationReceipt:result"
              ? data.receipt
              : write.receipt,
          events: [...write.events, data],
        },
      },
    };

    // if (
    //   data.type === "send" ||
    //   data.type === "send:result" ||
    //   data.type === "waitForUserOperationReceipt" ||
    //   data.type === "waitForUserOperationReceipt:result"
    // ) {
    //   console.log("incoming send", data);
    //   const send = data.type === "send" ? ({ ...data, events: [] } satisfies Send) : state.sends[data.writeId];
    //   return {
    //     ...state,
    //     sends: {
    //       ...state.sends,
    //       [data.writeId]: {
    //         ...send,
    //         type: data.type,
    //         events: [...send.events, data],
    //       },
    //     },
    //   };
    // } else {
    //   const write = data.type === "write" ? ({ ...data, events: [] } satisfies Write) : state.writes[data.writeId];
    //   return {
    //     ...state,
    //     writes: {
    //       ...state.writes,
    //       [data.writeId]: {
    //         ...write,
    //         type: data.type,
    //         hash: data.type === "waitForTransactionReceipt" ? data.hash : write.hash,
    //         events: [...write.events, data],
    //       },
    //     },
    //   };
    // }
  });
});
