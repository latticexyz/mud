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
  // We could allow for re-mounting to a different container here, but it feels like a foot-gun that is more often unintentional than intentional.
  // Instead, we'll just enforce that this instance can only be mounted once and has to be unmounted to change its root container.
  if (internalStore.getState().rootContainer) {
    throw new Error(
      "MUD Account Kit instance is only allowed to be mounted once and is already mounted. Try unmounting first to change the root container.",
    );
  }

  const rootContainer = initialRootContainer ?? document.body.appendChild(document.createElement("div"));
  internalStore.setState({ rootContainer });

  const queryClient = new QueryClient();

  const reactRoot = ReactDOM.createRoot(rootContainer);
  reactRoot.render(
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
    // TODO: do this via a mutation observer instead?
    internalStore.setState({ rootContainer: undefined });
    // If we created this root container, we can clean it up.
    if (rootContainer !== initialRootContainer) {
      rootContainer.remove();
    }
    reactRoot.unmount();
  };
}
