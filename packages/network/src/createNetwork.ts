import {
  BehaviorSubject,
  combineLatest,
  exhaustMap,
  filter,
  interval,
  Observable,
  ReplaySubject,
  Subject,
  throttleTime,
  withLatestFrom,
} from "rxjs";
import { createClock } from "./createClock";
import { callWithRetry, timeoutAfter } from "@latticexyz/utils";
import { ensureNetworkIsUp, fetchBlock } from "./networkUtils";
import { JsonRpcBatchProvider, JsonRpcProvider, WebSocketProvider } from "@ethersproject/providers";

export interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
  rpcSupportsBatchQueries: boolean;
  time: {
    period: number;
  };
  rpcWsUrl?: string;
}

export type ProviderPair = [JsonRpcProvider, WebSocketProvider?];

export enum ConnectionError {
  WEBSOCKET_CLOSED,
  TIMEOUT,
}

export type Network = {
  config$: Subject<NetworkConfig>;
  close: () => void;
  dispose: () => void;
  blockNumber$: Observable<number>;
  time$: Observable<number>;
  fresh$: Observable<boolean>;
  providers$: Observable<ProviderPair>;
  connected$: Observable<boolean>;
  connectionError$: Observable<ConnectionError>;
};

function createProviderPair(networkConfig: NetworkConfig): ProviderPair {
  const { rpcSupportsBatchQueries, rpcUrl, rpcWsUrl } = networkConfig;
  let jsonProvider;
  let wssProvider;
  if (rpcSupportsBatchQueries) {
    jsonProvider = new JsonRpcBatchProvider(rpcUrl);
  } else {
    jsonProvider = new JsonRpcProvider(rpcUrl);
  }
  if (rpcWsUrl) {
    wssProvider = new WebSocketProvider(rpcWsUrl);
  }
  return [jsonProvider, wssProvider];
}

export function createNetwork(initialConfig: NetworkConfig): Network {
  const {
    time: { period },
  } = initialConfig;

  const clock = createClock({
    initialValue: 0,
    period,
  });

  const config$ = new BehaviorSubject<NetworkConfig>(initialConfig);
  const close$ = new Subject<void>();

  const providers$ = new ReplaySubject<ProviderPair>(1);
  const blockNumber$ = new ReplaySubject<number>(1);
  const connected$ = new ReplaySubject<boolean>(1);
  const connectionError$ = new ReplaySubject<ConnectionError>(1);

  const createProviderAndHookErrorCallbacks = async (config: NetworkConfig): Promise<ProviderPair> => {
    const [jsonProvider, wssProvider] = createProviderPair(config);
    await ensureNetworkIsUp(jsonProvider, wssProvider);
    if (wssProvider) {
      wssProvider._websocket.onerror = () => {
        console.log("WEBSOCKET_CLOSED from on error");
        connectionError$.next(ConnectionError.WEBSOCKET_CLOSED);
        wssProvider.removeAllListeners();
        wssProvider._websocket.close();
      };
      (wssProvider._websocket as WebSocket).onclose = (e) => {
        wssProvider.removeAllListeners();
        if (!e.wasClean) {
          console.warn("Socket closed and unclean!");
          console.log("WEBSOCKET_CLOSED from on close");
          connectionError$.next(ConnectionError.WEBSOCKET_CLOSED);
        }
      };
    }
    return [jsonProvider, wssProvider];
  };

  const configSub = config$.subscribe(async (config: NetworkConfig) => {
    close$.next();
    const [jsonProvider, wssProvider] = await callWithRetry(createProviderAndHookErrorCallbacks, [config]);
    providers$.next([jsonProvider, wssProvider]);
    connected$.next(true);
  });

  const listenToNewBlocks = async (jsonProvider: JsonRpcProvider, wssProvider?: WebSocketProvider) => {
    if (wssProvider) {
      wssProvider.on("block", (blockNumber: number) => {
        blockNumber$.next(blockNumber);
      });
    } else {
      jsonProvider.on("block", (blockNumber: number) => blockNumber$.next(blockNumber));
    }
  };

  const providersSub = providers$.subscribe(([jsonProvider, wssProvider]) => {
    // on new providers
    listenToNewBlocks(jsonProvider, wssProvider);
    clock.tick(Date.now() - period);
  });

  const errorsSub = connectionError$.pipe(withLatestFrom(config$)).subscribe(async ([error, config]) => {
    close$.next();
    console.warn("Reconnecting because of an error " + error);
    const [jsonProvider, wssProvider] = await callWithRetry(createProviderAndHookErrorCallbacks, [config]);
    providers$.next([jsonProvider, wssProvider]);
    connected$.next(true);
  });

  const closeProvidersSub = close$.pipe(withLatestFrom(providers$)).subscribe(([, [jsonProvider, wssProvider]]) => {
    jsonProvider.removeAllListeners();
    wssProvider?.removeAllListeners();
    wssProvider?.destroy();
    connected$.next(false);
  });

  const keepAlive$ = interval(10000);

  const connectedSub = combineLatest([keepAlive$, connected$])
    .pipe(
      filter(([, connected]) => connected),
      withLatestFrom(providers$),
      exhaustMap(async ([, [, wssProvider]]) => {
        if (wssProvider) {
          try {
            await timeoutAfter(wssProvider.getBlockNumber(), 10000, "Network Request Timed out");
          } catch (_) {
            console.log("WEBSOCKET_CLOSED from keep alive");
            connectionError$.next(ConnectionError.WEBSOCKET_CLOSED);
          }
        }
      })
    )
    .subscribe(() => undefined);

  const blockSub = combineLatest([providers$, blockNumber$])
    .pipe(
      throttleTime(5000, undefined, { leading: true, trailing: true }),
      withLatestFrom(clock.lastFreshTime$, clock.time$)
    )
    .subscribe(async ([[[jsonProvider], blockNumber], lastFreshTime, currentClockTime]) => {
      const block = await fetchBlock(jsonProvider, blockNumber);
      const blockTimestamp = block.timestamp * 1000;
      if (blockTimestamp === lastFreshTime) {
        // we are stil on the same block
        return;
      }
      if (blockTimestamp !== currentClockTime) {
        // the clock is off! update it
        clock.tick(blockTimestamp);
      }
    });

  return {
    config$,
    close: () => close$.next(),
    dispose: () => {
      close$?.next();
      configSub?.unsubscribe();
      providersSub?.unsubscribe();
      errorsSub?.unsubscribe();
      connectedSub?.unsubscribe();
      closeProvidersSub?.unsubscribe();
      blockSub?.unsubscribe();
      clock.dispose();
    },
    time$: clock.time$,
    fresh$: clock.fresh$,
    blockNumber$: blockNumber$.asObservable(),
    providers$: providers$.asObservable(),
    connected$: connected$.asObservable(),
    connectionError$: connectionError$.asObservable(),
  };
}
