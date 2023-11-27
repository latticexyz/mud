import { setup } from "./mud/setup";
import type { SetupResult } from "./mud/setup";
import { writable } from "svelte/store";
import mudConfig from "contracts/mud.config";
import App from "./App.svelte";
import "./app.css";

export const MUDStore = writable<SetupResult | null>(null);

async function init() {
  const setupResult = await setup();
  MUDStore.set(setupResult);

  if (import.meta.env.MODE === "development") {
    const { mount: mountDevTools } = await import("@latticexyz/dev-tools");
    mountDevTools({
      config: mudConfig,
      publicClient: setupResult.network.publicClient,
      walletClient: setupResult.network.walletClient,
      latestBlock$: setupResult.network.latestBlock$,
      storedBlockLogs$: setupResult.network.storedBlockLogs$,
      worldAddress: setupResult.network.worldContract.address,
      worldAbi: setupResult.network.worldContract.abi,
      write$: setupResult.network.write$,
      recsWorld: setupResult.network.world,
    });
  }

  const app = new App({
    target: document.body,
  });
}

init();
