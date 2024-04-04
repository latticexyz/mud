import { setup } from "./mud/setup";
import mudConfig from "contracts/mud.config";

declare global {
  interface Window {
    increment: () => Promise<void>;
    willRevert: () => Promise<void>;
    sendMessage: () => Promise<void>;
  }
}

const {
  network,
  network: { tables, useStore, worldContract },
  systemCalls,
} = await setup();

// TODO: provide slice helpers and show subscribing to slices
useStore.subscribe((state) => {
  const value = state.getValue(tables.CounterTable, {});
  if (value) {
    document.getElementById("counter")!.innerHTML = String(value.value);
  }
});

// TODO: provide slice helpers and show subscribing to slices
useStore.subscribe((state, prevState) => {
  const record = state.getRecord(tables.MessageTable, {});
  if (record && record !== prevState.records[record.id]) {
    document.getElementById("chat-output")!.innerHTML += `${new Date().toLocaleString()}: ${record?.value.value}\n`;
  }
});

// Just for demonstration purposes: we create a global function that can be
// called to invoke the Increment system contract via the world. (See IncrementSystem.sol.)
window.increment = async () => {
  const result = await systemCalls.increment();
  console.log("increment result", result);
};

window.willRevert = async () => {
  // set gas limit so we skip estimation and can test tx revert
  const tx = await worldContract.write.willRevert({ gas: 100000n });

  console.log("willRevert tx", tx);
};

window.sendMessage = async () => {
  const input = document.getElementById("chat-input") as HTMLInputElement;
  const msg = input.value;
  if (!msg || msg.length === 0) return;

  input.value = "";

  const tx = await worldContract.write.sendMessage([msg]);

  console.log("sendMessage tx", tx);
};

document.getElementById("chat-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  window.sendMessage();
});

// https://vitejs.dev/guide/env-and-mode.html
if (import.meta.env.DEV) {
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
    useStore: network.useStore,
  });
}
