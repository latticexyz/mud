import { createContext, useContext, type ReactNode } from "react";
import { MUDLoginConfig } from "./common";

/** @internal */
const Context = createContext<MUDLoginConfig | null>(null);

export type Props = {
  config: MUDLoginConfig;
  children: ReactNode;
};

export function MUDLoginProvider({ config, children }: Props) {
  const currentConfig = useContext(Context);
  if (currentConfig) throw new Error("`MUDLoginProvider` can only be used once.");
  return <Context.Provider value={config}>{children}</Context.Provider>;
}

export function useLoginConfig(): MUDLoginConfig {
  const config = useContext(Context);
  if (!config) throw new Error("`useLoginConfig` be used within a `MUDLoginProvider`.");
  return config;
}
