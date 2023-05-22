import { computed, observable, toJS } from "mobx";
import { createSigner } from "./createSigner";
import { createReconnectingProvider } from "./createProvider";
import { NetworkConfig } from "./types";
import { combineLatest, concatMap, EMPTY, filter, map, throttleTime } from "rxjs";
import { createClock } from "./createClock";
import { fetchBlock } from "./networkUtils";
import { createBlockNumberStream } from "./createBlockNumberStream";
import { Signer, Wallet } from "ethers";
import { computedToStream } from "@latticexyz/utils";
import { privateKeyToAccount } from "viem/accounts";
import { Address, fallback, webSocket, http, createPublicClient, createWalletClient } from "viem";
import * as mudChains from "@latticexyz/common/chains";
import * as chains from "@wagmi/chains";
import * as devObservables from "./dev/observables";

export type Network = Awaited<ReturnType<typeof createNetwork>>;

/**
 * Set up network.
 *
 * @param initialConfig Initial config (see {@link NetworkConfig}).
 * @returns Network object
 */
export async function createNetwork(initialConfig: NetworkConfig) {
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
    const currentProviders = providers.get();
    if (config.provider.externalProvider) return currentProviders.json.getSigner();
    const privateKey = config.privateKey;
    if (privateKey && currentProviders) return createSigner(privateKey, currentProviders);
  });

  // Get address
  const initialConnectedAddress = config.provider.externalProvider ? await signer.get()?.getAddress() : undefined;
  const connectedAddress = computed(() =>
    config.privateKey ? new Wallet(config.privateKey).address.toLowerCase() : initialConnectedAddress?.toLowerCase()
  );
  const connectedAddressChecksummed = computed(() =>
    config.privateKey ? new Wallet(config.privateKey).address : initialConnectedAddress
  );

  // Listen to new block numbers
  const { blockNumber$, dispose: disposeBlockNumberStream } = createBlockNumberStream(providers);
  disposers.push(disposeBlockNumberStream);

  // Create local clock
  const clock = createClock(config.clock);
  disposers.push(clock.dispose);

  // Sync the local time to the chain time in regular intervals
  const syncBlockSub = combineLatest([blockNumber$, computedToStream(providers)])
    .pipe(
      throttleTime(config.clock.syncInterval, undefined, { leading: true, trailing: true }),
      concatMap(([blockNumber, currentProviders]) =>
        currentProviders ? fetchBlock(currentProviders.json, blockNumber) : EMPTY
      ), // Fetch the latest block if a provider is available
      map((block) => block.timestamp * 1000), // Map to timestamp in ms
      filter((blockTimestamp) => blockTimestamp !== clock.lastUpdateTime), // Ignore if the clock was already refreshed with this block
      filter((blockTimestamp) => blockTimestamp !== clock.currentTime) // Ignore if the current local timestamp is correct
    )
    .subscribe(clock.update); // Update the local clock
  disposers.push(() => syncBlockSub?.unsubscribe());

  // Create viem clients
  try {
    const possibleChains = Object.values({ ...mudChains, ...chains });
    if (config.chainConfig) {
      possibleChains.push(config.chainConfig);
    }
    const chain = possibleChains.find((c) => c.id === config.chainId);

    const publicClient = createPublicClient({
      chain,
      transport: fallback([webSocket(), http()]),
      pollingInterval: config.provider.options?.pollingInterval ?? config.clock.period ?? 1000,
    });
    const burnerAccount = config.privateKey ? privateKeyToAccount(config.privateKey as Address) : null;
    const burnerWalletClient = burnerAccount
      ? createWalletClient({
          account: burnerAccount,
          chain,
          transport: fallback([webSocket(), http()]),
          pollingInterval: config.provider.options?.pollingInterval ?? config.clock.period ?? 1000,
        })
      : null;

    devObservables.publicClient$.next(publicClient);
    devObservables.walletClient$.next(burnerWalletClient);
  } catch (error) {
    console.error("Could not initialize viem clients, dev tools may not work:", error);
  }

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
    connectedAddress,
    connectedAddressChecksummed,
    // TODO: TS complains about exporting these, figure out why
    // publicClient,
    // burnerWalletClient,
  };
}
