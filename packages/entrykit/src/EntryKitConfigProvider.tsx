import "@rainbow-me/rainbowkit/styles.css";
import { createContext, useContext, type ReactNode } from "react";
import { RainbowKitProvider, lightTheme, midnightTheme } from "@rainbow-me/rainbowkit";
import { EntryKitConfig } from "./config/output";
import { Chain } from "viem";
import { useChains } from "wagmi";

type ContextValue = EntryKitConfig & {
  chain: Chain;
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

  return (
    <RainbowKitProvider
      // Prevent RainbowKit/Wagmi trying to switch chains after connection
      // https://github.com/rainbow-me/rainbowkit/blob/d76bb28a67609d9855b8045e5f5f4641dff1e032/packages/rainbowkit/src/wallets/useWalletConnectors.ts#L58-L67
      // https://github.com/wevm/wagmi/blob/cb58b1ea3ad40e77210f24eb598f9d2306db998c/packages/core/src/connectors/injected.ts#L176-L184
      initialChain={0}
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
      <Context.Provider value={{ ...config, chain }}>{children}</Context.Provider>
    </RainbowKitProvider>
  );
}

export function useEntryKitConfig(): ContextValue {
  const config = useContext(Context);
  if (!config) throw new Error("`useEntryKitConfig` can only be used within a `EntryKitProvider`.");
  return config;
}
