import "@rainbow-me/rainbowkit/styles.css";
import type { Config as WagmiConfig } from "wagmi";
import type { Config as AccountKitConfig } from "../AccountKitProvider";
import { Store, store } from "./store";

export type MountOptions = {
  rootElementId?: string;
  wagmiConfig: WagmiConfig;
  accountKitConfig: AccountKitConfig;
};

export type MountResult = {
  unmount: () => void;
  store: Store;
};

export function mount({ rootElementId = "mud-account-kit", wagmiConfig, accountKitConfig }: MountOptions): MountResult {
  if (typeof window === "undefined") {
    throw new Error("MUD Account Kit should only be used in browser bundles.");
  }

  if (document.getElementById(rootElementId)) {
    throw new Error("MUD Account Kit is already mounted.");
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

    const rootElement = document.createElement("div");
    rootElement.id = rootElementId;
    // Create a new stacking context
    // https://web.dev/learn/css/z-index/#stacking-context
    rootElement.style.willChange = "contents";
    document.body.appendChild(rootElement);

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              appInfo={{
                appName: accountKitConfig.appInfo?.name,
                // TODO: learn more and disclaimer
              }}
              theme={{
                lightMode: lightTheme({ borderRadius: "none" }),
                darkMode: midnightTheme({ borderRadius: "none" }),
              }}
            >
              <AccountKitProvider config={accountKitConfig}>
                <SyncStore store={store} />
              </AccountKitProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </React.StrictMode>,
    );

    return () => {
      root.unmount();
      rootElement.remove();
    };
  }

  const setupPromise = setup().catch((error) => {
    console.error("Failed to mount MUD Account Kit.", error);
  });

  return {
    unmount: () => setupPromise.then((unmount) => unmount?.()),
    store,
  };
}
