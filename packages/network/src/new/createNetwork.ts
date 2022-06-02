import { computed, observable, reaction, toJS } from "mobx";
import { createSigner } from "./createSigner";
import { createReconnectingProvider } from "./createProvider";
import { NetworkConfig } from "./types";
import { concatMap, filter, map, ReplaySubject, throttleTime } from "rxjs";
import { createClock } from "./createClock";
import { fetchBlock } from "../networkUtils";

export function createNetwork(initialConfig: NetworkConfig) {
  const config = observable(initialConfig);
  const disposers: (() => void)[] = [];
  const {
    providers,
    connected,
    dispose: disposeProvider,
  } = createReconnectingProvider(computed(() => toJS(config.provider)));
  disposers.push(disposeProvider);

  // Create signer
  const signer = computed(() => {
    const privateKey = config.privateKey;
    if (privateKey) return createSigner(privateKey, providers.get());
  });

  // Listen to new block numbers
  const blockNumber$ = new ReplaySubject<number>(1);
  disposers.push(
    reaction(
      () => providers.get(),
      (currProviders) => {
        const provider = currProviders.ws || currProviders.json;
        provider.on("block", (blockNumber: number) => blockNumber$.next(blockNumber));
      }
    )
  );

  // Create local clock
  const clock = createClock(config.clock);
  disposers.push(clock.dispose);

  // Sync the local time to the chain time in regular intervals
  const syncBlockSub = blockNumber$
    .pipe(
      throttleTime(5000, undefined, { leading: true, trailing: true }), // Update time max once per 5s
      concatMap((blockNumber) => fetchBlock(providers.get().json, blockNumber)), // Fetch the latest block
      map((block) => block.timestamp * 1000), // Map to timestamp in ms
      filter((blockTimestamp) => blockTimestamp === clock.lastUpdateTime), // Ignore if the clock was already refreshed with this block
      filter((blockTimestamp) => blockTimestamp === clock.currentTime) // Ignore if the current local timestamp is correct
    )
    .subscribe(clock.update); // Update the local clock
  disposers.push(() => syncBlockSub?.unsubscribe());

  return {
    providers,
    signer,
    connected,
    blockNumber$,
    dispose: () => {
      for (const disposer of disposers) disposer();
    },
    clock,
    config,
  };
}
