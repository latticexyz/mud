import { createContext, useContext, type ReactNode } from "react";
import { Address } from "viem";

export type Config = {
  chainId: number;
  worldAddress: Address;
  gasTankAddress: Address;
};

/** @internal */
const Context = createContext<Config | null>(null);

export type Props = {
  config: Config;
  children: ReactNode;
};

export function MUDAccountKitProvider({ config, children }: Props) {
  const currentConfig = useContext(Context);
  if (currentConfig) throw new Error("`MUDAccountKitProvider` can only be used once.");
  return <Context.Provider value={config}>{children}</Context.Provider>;
}

export function useConfig(): Config {
  const config = useContext(Context);
  if (!config) throw new Error("`useConfig` be used within a `MUDAccountKitProvider`.");
  return config;
}
