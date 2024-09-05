"use client";

// import { Hash } from "viem";
// import { waitForTransactionReceipt } from "viem/actions";
// import { getAction } from "viem/utils";
import { createStore } from "zustand/vanilla";

// import { getClient } from "@wagmi/core";
// import { wagmiConfig } from "../app/(explorer)/Providers";

// const client = getClient(wagmiConfig);
// const writes = new Map<string, PromiseWithResolvers<Hash>>();

const channel = new BroadcastChannel("explorer/monitor");
console.log("listening", channel);
channel.addEventListener("message", ({ data }) => {
  console.log("got relayed message", data);

  // if (data.type === "write") {
  //   const writePromise = Promise.withResolvers<Hash>();
  //   writes.set(data.id, writePromise);
  //   startWrite(data.id, data.functionSignature, data.args);
  //   addTiming(data.id, "writeContract", writePromise.promise);
  //   addTiming(
  //     data.id,
  //     "waitForTransactionReceipt",
  //     writePromise.promise.then((hash) =>
  //       getAction(
  //         client,
  //         waitForTransactionReceipt,
  //         "waitForTransactionReceipt",
  //       )({ hash }).then((receipt) => {
  //         if (receipt.status === "reverted") throw new Error("transaction reverted");
  //         return receipt;
  //       }),
  //     ),
  //   );
  //   // TODO: waitForStateChange
  // }
  // if (data.type === "write:resolve") {
  //   const writePromise = writes.get(data.id);
  //   if (writePromise) writePromise.resolve(data.hash);
  // }
  // if (data.type === "write:reject") {
  //   const writePromise = writes.get(data.id);
  //   if (writePromise) writePromise.reject(data.error);
  // }
});

export type TimingPromise = Promise<{ start: number; end: number } & PromiseSettledResult<unknown>>;

export type Write = {
  id: string;
  // TODO: error signatures for parsing errors
  functionSignature: string;
  args: unknown[];
  timings: {
    [label: string]: TimingPromise;
  };
};

export type State = {
  writes: {
    [id: string]: Write;
  };
};

export const store = createStore<State>(() => ({
  writes: {},
}));

export function startWrite(id: string, functionSignature: string, args: unknown[]) {
  store.setState((state) => ({
    writes: {
      ...state.writes,
      [id]: {
        id,
        functionSignature,
        args,
        timings: {},
      },
    },
  }));
  return id;
}

export function addTiming(id: string, label: string, promise: Promise<unknown>) {
  const start = Date.now();
  store.setState((state) => ({
    writes: {
      ...state.writes,
      [id]: {
        ...state.writes[id],
        timings: {
          ...state.writes[id].timings,
          [label]: Promise.allSettled([promise]).then(([settled]) => ({
            ...settled,
            start,
            end: Date.now(),
          })),
        },
      },
    },
  }));
}
