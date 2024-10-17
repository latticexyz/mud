import "@rainbow-me/rainbowkit/styles.css";
import { createContext, useContext, type ReactNode } from "react";
import { RainbowKitProvider, lightTheme, midnightTheme } from "@rainbow-me/rainbowkit";
import { EntryKitConfig } from "./config";

/** @internal */
const Context = createContext<EntryKitConfig | null>(null);

export type Props = {
  config: EntryKitConfig;
  children?: ReactNode;
};

export function EntryKitConfigProvider({ config, children }: Props) {
  const currentConfig = useContext(Context);
  if (currentConfig) throw new Error("`EntryKitProvider` can only be used once.");

  // throw new Error("here");
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

export function useEntryKitConfig(): EntryKitConfig {
  const config = useContext(Context);
  if (!config) throw new Error("`useEntryKitConfig` can only be used within a `EntryKitProvider`.");
  return config;
}
