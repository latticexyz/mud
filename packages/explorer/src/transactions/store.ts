"use client";

import { createStore } from "zustand/vanilla";
import { channel } from "./channel";

channel.addEventListener("message", (event) => {
  const id = startWrite(event.data.functionSignature, event.data.args);
  id;
  // TODO: add timings
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

let count = 0;

export const store = createStore<State>(() => ({
  writes: {},
}));

export function startWrite(functionSignature: string, args: unknown[]) {
  const id = `${Date.now()}-${++count}`;
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

export function addTiming(writeId: string, label: string, promise: Promise<unknown>) {
  const start = Date.now();
  store.setState((state) => ({
    writes: {
      ...state.writes,
      [writeId]: {
        ...state.writes[writeId],
        timings: {
          ...state.writes[writeId].timings,
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
