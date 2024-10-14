"use client";

import { type ReactNode, createContext, useRef } from "react";
import { TransactionsWatcher } from "../observe/TransactionsWatcher";
import { createWorldStore } from "./createWorldStore";

export type WorldStore = ReturnType<typeof createWorldStore>;

export const WorldStoreContext = createContext<WorldStore | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const WorldStoreProvider = ({ children }: Props) => {
  const storeRef = useRef<WorldStore>();
  if (!storeRef.current) {
    storeRef.current = createWorldStore();
  }

  return (
    <WorldStoreContext.Provider value={storeRef.current}>
      <TransactionsWatcher>{children}</TransactionsWatcher>
    </WorldStoreContext.Provider>
  );
};
