import { createContext, useContext, type ReactNode } from "react";
import { AccountModal } from "./AccountModal";
import { Config } from "./config";

/** @internal */
const Context = createContext<Config | null>(null);

export type Props = {
  config: Config;
  children?: ReactNode;
};

export function AccountKitProvider({ config, children }: Props) {
  const currentConfig = useContext(Context);
  if (currentConfig) throw new Error("`AccountKitProvider` can only be used once.");
  return (
    <Context.Provider value={config}>
      {children}
      <AccountModal />
    </Context.Provider>
  );
}

export function useConfig(): Config {
  const config = useContext(Context);
  if (!config) throw new Error("`useConfig` can only be used within a `AccountKitProvider`.");
  return config;
}
