"use client";

import { Address, Hash } from "viem";
import { createStore } from "zustand/vanilla";
import { DecodedUserOperationCall } from "../app/(explorer)/[chainName]/worlds/[worldAddress]/observe/useObservedTransactions";
import { isPromiseFulfilled } from "../utils";
import { relayChannelName } from "./common";
import { debug } from "./debug";
import { Message, MessageType, Messages } from "./messages";

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
const messageBuffer: MessageEvent<Message>[] = [];
const channel = new BroadcastChannel(relayChannelName);

channel.addEventListener("message", (message: MessageEvent<Message>) => {
  if (message.data.type === "ping") return;
  messageBuffer.push(message);
});

function flushMessageBuffer(): void {
  if (messageBuffer.length === 0) return;

  store.setState((state) => {
    let updated = state;

    for (const { data } of messageBuffer) {
      if (data.type === "ping") continue;

      const write = data.type === "write" ? ({ ...data, events: [] } satisfies Write) : updated.writes[data.writeId];
      if (!write) continue;

      let hash = write.hash;
      if (data.type === "waitForTransactionReceipt") {
        hash = data.hash;
      } else if (
        data.type === "waitForUserOperationReceipt:result" &&
        isPromiseFulfilled<
          Messages["waitForUserOperationReceipt:result"] extends PromiseSettledResult<infer T> ? T : never
        >(data)
      ) {
        hash = data.value.receipt.transactionHash;
      }

      updated = {
        ...updated,
        writes: {
          ...updated.writes,
          [data.writeId]: {
            ...write,
            type: data.type,
            hash,
            userOpHash: data.type === "waitForUserOperationReceipt" ? data.userOpHash : write.userOpHash,
            events: [...write.events, data],
          },
        },
      };
    }

    // Clear messages after processing
    messageBuffer.length = 0;
    return updated;
  });
}

const bufferInterval = 100;
setInterval(flushMessageBuffer, bufferInterval);
