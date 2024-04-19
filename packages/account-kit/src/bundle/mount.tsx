import rainbowKitCss from "@rainbow-me/rainbowkit/styles.css?inline";
import type { Config as WagmiConfig } from "wagmi";
import type { Config as AccountKitConfig } from "../config";
import { store } from "./store";
import { internalStore } from "./internalStore";
import { Buttons } from "./Buttons";

export type MountOptions = {
  // TODO: accept a CSS selector?
  rootContainer?: Element | undefined;
  // TODO: make this a top-level config
  accountKitConfig: AccountKitConfig;
  // TODO: can we do sane defaults here based on e.g. chain?
  wagmiConfig: WagmiConfig;
  // TODO: add walletConnectProjectId
};

if (typeof window === "undefined" || typeof document === "undefined") {
  // TODO: should we throw inside `mount()` instead of at import time?
  throw new Error("MUD Account Kit should only be used in browser bundles.");
}

export function mount({
  rootContainer: initialRootContainer,
  wagmiConfig,
  accountKitConfig,
}: MountOptions): () => void {
  async function setup() {
    // TODO: do async imports like this help us at all with bundle sizes/code splitting?
    const React = await import("react");
    const ReactDOM = await import("react-dom/client");
    const { WagmiProvider } = await import("wagmi");
    const { QueryClientProvider, QueryClient } = await import("@tanstack/react-query");
    const { RainbowKitProvider, lightTheme, midnightTheme } = await import("@rainbow-me/rainbowkit");
    const { AccountKitProvider } = await import("../AccountKitProvider");
    const { SyncStore } = await import("./SyncStore");

    if (internalStore.getState().rootContainer) {
      throw new Error("MUD Account Kit is already mounted and only one instance is allowed on the page at a time.");
    }

    const queryClient = new QueryClient();
    const rootContainer = initialRootContainer ?? document.body.appendChild(document.createElement("div"));

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
                <SyncStore store={store} />
                <Buttons />
                <style dangerouslySetInnerHTML={{ __html: rainbowKitCss }} />
              </AccountKitProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </React.StrictMode>,
    );

    internalStore.setState({ rootContainer });

    return () => {
      // TODO: can we do this after removing from DOM tree? if so, do this via mutation observer instead?
      root.unmount();
      rootContainer.remove();
      // TODO: do this via a mutation observer instead?
      internalStore.setState({ rootContainer: undefined });
    };
  }

  const setupPromise = setup().catch((error) => {
    console.error("Failed to mount MUD Account Kit.", error);
  });

  return () => setupPromise.then((unmount) => unmount?.());
}
