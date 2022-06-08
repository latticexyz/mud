import { computed, observable, toJS } from "mobx";
import { createSigner } from "./createSigner";
import { createReconnectingProvider } from "./createProvider";
import { NetworkConfig } from "./types";
import { concatMap, EMPTY, filter, map, of, throttleTime, withLatestFrom } from "rxjs";
import { createClock } from "./createClock";
import { fetchBlock } from "./networkUtils";
import { createBlockNumberStream } from "./createBlockNumberStream";
import { Signer } from "ethers";

export async function createNetwork(initialConfig: NetworkConfig) {
  console.log("Creating network");
  const config = observable(initialConfig);
  const disposers: (() => void)[] = [];
  const {
    providers,
    connected,
    dispose: disposeProvider,
  } = await createReconnectingProvider(computed(() => toJS(config.provider)));
  disposers.push(disposeProvider);

  // Create signer
  const signer = computed<Signer | undefined>(() => {
    const privateKey = config.privateKey;
    const currentProviders = providers.get();
    if (privateKey && currentProviders) return createSigner(privateKey, currentProviders);
  });

  // Listen to new block numbers
  const { blockNumber$, dispose: disposeBlockNumberStream } = createBlockNumberStream(providers);
  disposers.push(disposeBlockNumberStream);

  // Create local clock
  const clock = createClock(config.clock);
  disposers.push(clock.dispose);

  // Sync the local time to the chain time in regular intervals
  const syncBlockSub = blockNumber$
    .pipe(
      throttleTime(5000, undefined, { leading: true, trailing: true }), // Update time max once per 5s
      withLatestFrom(of(providers.get())), // Get the latest providers
      concatMap(([blockNumber, currentProviders]) =>
        currentProviders ? fetchBlock(currentProviders.json, blockNumber) : EMPTY
      ), // Fetch the latest block if a provider is available
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
