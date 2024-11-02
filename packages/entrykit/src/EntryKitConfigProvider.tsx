import "@rainbow-me/rainbowkit/styles.css";
import { createContext, useContext, type ReactNode } from "react";
import { RainbowKitProvider, lightTheme, midnightTheme } from "@rainbow-me/rainbowkit";
import { EntryKitConfig } from "./config/output";
import { Address, Chain } from "viem";
import { useChains } from "wagmi";
import { getPaymasterAddress } from "./getPaymasterAddress";

type ContextValue = EntryKitConfig & {
  chain: Chain;
  paymasterAddress: Address;
};

/** @internal */
const Context = createContext<ContextValue | null>(null);

export type Props = {
  config: EntryKitConfig;
  children?: ReactNode;
};

export function EntryKitConfigProvider({ config, children }: Props) {
  const currentConfig = useContext(Context);
  if (currentConfig) throw new Error("`EntryKitProvider` can only be used once.");

  // TODO: move chain-based lookups to function so we can reuse here and in passkeyConnector

  const chains = useChains();
  const chain = chains.find(({ id }) => id === config.chainId);
  if (!chain) throw new Error(`Could not find configured chain for chain ID ${config.chainId}.`);

  const paymasterAddress = getPaymasterAddress(chain);

  return (
    <RainbowKitProvider
      appInfo={{
        appName: config.appName,
        // TODO: learn more and disclaimer
      }}
      theme={
        config.theme === "light"
          ? lightTheme({ borderRadius: "none" })
          : config.theme === "dark"
            ? midnightTheme({ borderRadius: "none" })
            : {
                lightMode: lightTheme({ borderRadius: "none" }),
                darkMode: midnightTheme({ borderRadius: "none" }),
              }
      }
    >
      <Context.Provider value={{ ...config, chain, paymasterAddress }}>{children}</Context.Provider>
    </RainbowKitProvider>
  );
}

export function useEntryKitConfig(): ContextValue {
  const config = useContext(Context);
  if (!config) throw new Error("`useEntryKitConfig` can only be used within a `EntryKitProvider`.");
  return config;
}
