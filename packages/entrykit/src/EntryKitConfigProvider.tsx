import "@rainbow-me/rainbowkit/styles.css";
import { createContext, useContext, type ReactNode } from "react";
import { RainbowKitProvider, lightTheme, midnightTheme } from "@rainbow-me/rainbowkit";
import { Config } from "./config";
import { usePasskeyConnector } from "./usePasskeyConnector";

/** @internal */
const Context = createContext<Config | null>(null);

export type Props = {
  config: Config;
  children?: ReactNode;
};

export function EntryKitConfigProvider({ config, children }: Props) {
  const currentConfig = useContext(Context);
  if (currentConfig) throw new Error("`EntryKitProvider` can only be used once.");

  // ensure we have passkey connector configured
  usePasskeyConnector();

  return (
    <RainbowKitProvider
      initialChain={config.chainId}
      appInfo={{
        appName: config.appInfo?.name,
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
      <Context.Provider value={config}>{children}</Context.Provider>
    </RainbowKitProvider>
  );
}

export function useConfig(): Config {
  const config = useContext(Context);
  if (!config) throw new Error("`useConfig` can only be used within a `EntryKitProvider`.");
  return config;
}
