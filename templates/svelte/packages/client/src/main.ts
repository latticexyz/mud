import { setup } from "./mud/setup";
import mudConfig from "contracts/mud.config";
import App from "./App.svelte";
import "./app.css";

let components: any, systemCalls: any, network: any;

async function init() {
  const setupResult = await setup();
  components = setupResult.components;
  systemCalls = setupResult.systemCalls;
  network = setupResult.network;

  if (import.meta.env.MODE === "development") {
    const { mount: mountDevTools } = await import("@latticexyz/dev-tools");
    mountDevTools({
      config: mudConfig,
      publicClient: network.publicClient,
      walletClient: network.walletClient,
      latestBlock$: network.latestBlock$,
      storedBlockLogs$: network.storedBlockLogs$,
      worldAddress: network.worldContract.address,
      worldAbi: network.worldContract.abi,
      write$: network.write$,
      recsWorld: network.world,
    });
  }

  const app = new App({
    target: document.body,
    props: {
      components,
      systemCalls,
      network,
    },
  });
}

init();

//export { components, systemCalls, network } for use.
export function getSetup() {
  return { components, systemCalls, network };
}
