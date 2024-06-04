// TODO: move rainbowkit inside iframe
import rainbowKitCss from "@rainbow-me/rainbowkit/styles.css?inline";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme, midnightTheme } from "@rainbow-me/rainbowkit";
import type { Config as WagmiConfig } from "wagmi";
import type { Config as AccountKitConfig } from "../core/config";
import { AccountKitProvider } from "../core/AccountKitProvider";
import { SyncStore } from "./SyncStore";
import { Buttons } from "./Buttons";
import { ExternalStore } from "./createExternalStore";
import { InternalStore } from "./createInternalStore";

export type MountOptions = {
  rootContainer?: Element | undefined;
  accountKitConfig: AccountKitConfig;
  wagmiConfig: WagmiConfig;
  externalStore: ExternalStore;
  internalStore: InternalStore;
};

export function mount({
  rootContainer: initialRootContainer,
  wagmiConfig,
  accountKitConfig,
  externalStore,
  internalStore,
}: MountOptions): () => void {
  if (internalStore.getState().rootContainer) {
    throw new Error("MUD Account Kit is already mounted and only one instance is allowed on the page at a time.");
  }

  const rootContainer = initialRootContainer ?? document.body.appendChild(document.createElement("div"));
  internalStore.setState({ rootContainer });

  async function setup() {
    const queryClient = new QueryClient();

    const root = ReactDOM.createRoot(rootContainer);
    root.render(
      <React.StrictMode>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              appInfo={{
                appName: accountKitConfig.appInfo?.name,
                // TODO: learn more and disclaimer
              }}
              theme={
                accountKitConfig.theme === "light"
                  ? lightTheme({ borderRadius: "none" })
                  : accountKitConfig.theme === "dark"
                    ? midnightTheme({ borderRadius: "none" })
                    : {
                        lightMode: lightTheme({ borderRadius: "none" }),
                        darkMode: midnightTheme({ borderRadius: "none" }),
                      }
              }
            >
              <AccountKitProvider config={accountKitConfig}>
                <SyncStore externalStore={externalStore} />
                <Buttons internalStore={internalStore} />
                <style dangerouslySetInnerHTML={{ __html: rainbowKitCss }} />
              </AccountKitProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </React.StrictMode>,
    );

    return () => {
      root.unmount();
    };
  }

  const setupPromise = setup().catch((error) => {
    console.error("Failed to mount MUD Account Kit.", error);
  });

  return () => {
    // TODO: do this via a mutation observer instead?
    internalStore.setState({ rootContainer: undefined });
    // If we created this root container, we can clean it up.
    if (rootContainer !== initialRootContainer) {
      rootContainer.remove();
    }
    setupPromise.then((unmount) => unmount?.());
  };
}
