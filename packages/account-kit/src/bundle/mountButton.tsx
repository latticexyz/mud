import rainbowKitCss from "@rainbow-me/rainbowkit/styles.css?inline";
import type { Config as WagmiConfig } from "wagmi";
import type { Config as AccountKitConfig } from "../AccountKitProvider";
import { store } from "./store";
import { AccountButton } from "../AccountButton";

export type MountOptions = {
  wagmiConfig: WagmiConfig;
  accountKitConfig: AccountKitConfig;
};

export function mountButton(element: HTMLElement, { wagmiConfig, accountKitConfig }: MountOptions): () => void {
  if (typeof window === "undefined") {
    throw new Error("MUD Account Kit should only be used in browser bundles.");
  }

  async function setup() {
    // TODO: do async imports like this help us at all with bundle sizes/code splitting?
    const React = await import("react");
    const ReactDOM = await import("react-dom/client");
    const { WagmiProvider } = await import("wagmi");
    const { QueryClientProvider, QueryClient } = await import("@tanstack/react-query");
    const { RainbowKitProvider, lightTheme, midnightTheme } = await import("@rainbow-me/rainbowkit");
    const { AccountKitProvider } = await import("../AccountKitProvider");
    const { SyncStore } = await import("./SyncStore");

    const queryClient = new QueryClient();

    // RainbowKit renders an outer <div>
    // TODO: move to rendering the actual button into a portal as a sibling of the tree

    const root = ReactDOM.createRoot(element);
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
                <AccountButton />
                <SyncStore store={store} />
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

  return () => setupPromise.then((unmount) => unmount?.());
}
