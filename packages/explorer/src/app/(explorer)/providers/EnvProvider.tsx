"use client";

import React, { ReactNode, createContext, useContext } from "react";

type EnvContextType = Record<string, string>;

const EnvContext = createContext<EnvContextType>({});

export function useEnv() {
  return useContext(EnvContext);
}

type EnvProviderProps = {
  children: ReactNode;
  env: Record<string, string>;
};

export function EnvProvider({ children, env }: EnvProviderProps) {
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
}
