"use client";

import { type ReactNode, createContext, useRef } from "react";
import { createAppStore } from "./createAppStore";

export type AppStore = ReturnType<typeof createAppStore>;

export const AppStoreContext = createContext<AppStore | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const AppStoreProvider = ({ children }: Props) => {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = createAppStore();
  }

  return <AppStoreContext.Provider value={storeRef.current}>{children}</AppStoreContext.Provider>;
};
