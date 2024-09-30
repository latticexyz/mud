import type { Config as WagmiConfig } from "wagmi";
import type { Config as entryKitConfig } from "../config";
import { store } from "./store";
import { internalStore } from "./internalStore";
import { Buttons } from "./Buttons";

export type MountOptions = {
  // TODO: accept a CSS selector?
  rootContainer?: Element | undefined;
  // TODO: make this a top-level config
  entryKitConfig: entryKitConfig;
  // TODO: can we do sane defaults here based on e.g. chain?
  wagmiConfig: WagmiConfig;
};

if (typeof window === "undefined" || typeof document === "undefined") {
  // TODO: should we throw inside `mount()` instead of at import time?
  throw new Error("EntryKit should only be used in browser bundles.");
}

export function mount({ rootContainer: initialRootContainer, wagmiConfig, entryKitConfig }: MountOptions): () => void {
  if (internalStore.getState().rootContainer) {
    throw new Error("EntryKit is already mounted and only one instance is allowed on the page at a time.");
  }

  const rootContainer = initialRootContainer ?? document.body.appendChild(document.createElement("div"));
  internalStore.setState({ rootContainer });

  async function setup() {
    // TODO: do async imports like this help us at all with bundle sizes/code splitting?
    const React = await import("react");
    const ReactDOM = await import("react-dom/client");
    const { WagmiProvider } = await import("wagmi");
    const { QueryClientProvider, QueryClient } = await import("@tanstack/react-query");
    const { EntryKitProvider } = await import("../EntryKitProvider");
    const { SyncStore } = await import("./SyncStore");

    const queryClient = new QueryClient();

    const root = ReactDOM.createRoot(rootContainer);
    root.render(
      <React.StrictMode>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <EntryKitProvider config={entryKitConfig}>
              <SyncStore store={store} />
              <Buttons />
            </EntryKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </React.StrictMode>,
    );

    return () => {
      root.unmount();
    };
  }

  const setupPromise = setup().catch((error) => {
    console.error("Failed to mount EntryKit.", error);
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
