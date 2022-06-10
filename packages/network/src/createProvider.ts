import { JsonRpcBatchProvider, JsonRpcProvider, WebSocketProvider } from "@ethersproject/providers";
import { callWithRetry, observableToComputed, timeoutAfter } from "@latticexyz/utils";
import { IComputedValue, IObservableValue, observable, reaction, runInAction } from "mobx";
import { ensureNetworkIsUp } from "./networkUtils";
import { ProviderConfig, Providers } from "./types";

export function createProvider({ jsonRpcUrl, wsRpcUrl, options }: ProviderConfig) {
  const providers = {
    json: options?.batch ? new JsonRpcBatchProvider(jsonRpcUrl) : new JsonRpcProvider(jsonRpcUrl),
    ws: wsRpcUrl ? new WebSocketProvider(wsRpcUrl) : undefined,
  };

  if (options?.pollingInterval) {
    providers.json.pollingInterval = options.pollingInterval;
  }

  return providers;
}

export enum ConnectionState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
}

export async function createReconnectingProvider(config: IComputedValue<ProviderConfig>) {
  const connected = observable.box<ConnectionState>(ConnectionState.DISCONNECTED);
  const providers = observable.box<Providers>() as IObservableValue<Providers>;
  const disposers: (() => void)[] = [];

  async function initProviders() {
    // Abort if connection is currently being established
    if (connected.get() === ConnectionState.CONNECTING) return;

    console.log("Initializing providers");

    // Invalidate current providers
    runInAction(() => connected.set(ConnectionState.CONNECTING));

    // Remove listeners from stale providers and close open connections
    const prevProviders = providers.get();
    prevProviders?.json.removeAllListeners();
    prevProviders?.ws?.removeAllListeners();
    try {
      prevProviders?.ws?._websocket?.close();
    } catch {
      // Ignore errors when closing websocket that was not in an open state
    }

    const conf = config.get();

    // Create new providers
    await callWithRetry(async () => {
      const newProviders = createProvider(conf);
      // If the connection is not successful, this will throw an error, triggering a retry
      !conf?.options?.skipNetworkCheck && (await ensureNetworkIsUp(newProviders.json, newProviders.ws));
      runInAction(() => {
        providers.set(newProviders);
        connected.set(ConnectionState.CONNECTED);
      });
    });
  }

  // Create new providers if config changes
  disposers.push(
    reaction(
      () => config.get(),
      () => {
        console.log("Config changed");
        initProviders();
      }
    )
  );

  // Reconnect providers in case of error
  disposers.push(
    reaction(
      () => providers.get(),
      (currentProviders) => {
        if (currentProviders?.ws?._websocket) {
          currentProviders.ws._websocket.onerror = initProviders;
          currentProviders.ws._websocket.onclose = () => {
            // Only reconnect if closed unexpectedly
            if (connected.get() === ConnectionState.CONNECTED) {
              initProviders();
            }
          };
        }
      }
    )
  );

  // Keep websocket connection alive
  const keepAliveInterval = setInterval(async () => {
    if (connected.get() !== ConnectionState.CONNECTED) return;
    const currentProviders = providers.get();
    if (!currentProviders?.ws) return;
    try {
      await timeoutAfter(currentProviders.ws.getBlockNumber(), 10000, "Network Request Timed out");
    } catch {
      initProviders();
    }
  }, 10000);
  disposers.push(() => clearInterval(keepAliveInterval));

  await initProviders();

  return {
    connected: observableToComputed(connected),
    providers: observableToComputed(providers),
    dispose: () => {
      for (const disposer of disposers) disposer();
      try {
        providers.get()?.ws?._websocket?.close();
      } catch {
        // Ignore error if websocket is not on OPEN state
      }
    },
  };
}
