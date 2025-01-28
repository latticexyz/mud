import type { Config as WagmiConfig } from "wagmi";
import { store } from "./store";
import { internalStore } from "./internalStore";
import { Buttons } from "./Buttons";
import type { EntryKitConfig } from "../config/output";
import type { QueryClient } from "@tanstack/react-query";

export type MountOptions = {
  wagmiConfig: WagmiConfig;
  queryClient?: QueryClient;
  entryKitConfig: EntryKitConfig;
  rootContainer?: Element | undefined;
};

export function mount({
  rootContainer: initialRootContainer,
  wagmiConfig,
  queryClient: initialQueryClient,
  entryKitConfig,
}: MountOptions): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("EntryKit can only be mounted in browser contexts.");
  }

  if (internalStore.getState().rootContainer) {
    throw new Error("EntryKit is already mounted and only one instance is allowed on the page at a time.");
  }

  const rootContainer = initialRootContainer ?? document.body.appendChild(document.createElement("div"));
  internalStore.setState({ rootContainer });

  async function setup() {
    // TODO: do async imports like this help us at all with bundle sizes/code splitting?
    const React = await import("react");
    const { createRoot } = await import("react-dom/client");
    const { WagmiProvider } = await import("wagmi");
    const { QueryClientProvider, QueryClient } = await import("@tanstack/react-query");
    const { EntryKitProvider } = await import("../EntryKitProvider");
    const { SyncStore } = await import("./SyncStore");

    const queryClient = initialQueryClient ?? new QueryClient();

    const root = createRoot(rootContainer);
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

    return function unmount() {
      root.unmount();
    };
  }

  const setupPromise = setup().catch((error) => {
    console.error("Failed to mount EntryKit.", error);
  });

  return function unmount() {
    internalStore.setState({ rootContainer: undefined });
    // If we created this root container, we can clean it up.
    if (rootContainer !== initialRootContainer) {
      rootContainer.remove();
    }
    setupPromise.then((unmount) => unmount?.());
  };
}
