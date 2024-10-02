import "@rainbow-me/rainbowkit/styles.css";
import { createContext, useContext, type ReactNode } from "react";
import { RainbowKitProvider, lightTheme, midnightTheme } from "@rainbow-me/rainbowkit";
import { Config } from "./config";
import { useConnectors } from "wagmi";
import { passkeyConnector } from "./passkey/passkeyConnector";

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
  const connectors = useConnectors();
  const connector = connectors.find((c) => c.type === passkeyConnector.type);
  if (!connector) {
    // TODO: provide link to instructions
    throw new Error(
      "Could not find passkey connector. Did you configure Wagmi with the EntryKit passkey connector or passkey wallet?",
    );
  }

  return (
    <RainbowKitProvider
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
