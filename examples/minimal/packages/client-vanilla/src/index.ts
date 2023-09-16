import { setup } from "./mud/setup";
import mudConfig from "contracts/mud.config";

const { components, network } = await setup();
const { worldContract, waitForTransaction } = network;

// Components expose a stream that triggers when the component is updated.
components.CounterTable.update$.subscribe((update) => {
  const [nextValue, prevValue] = update.value;
  console.log("Counter updated", update, { nextValue, prevValue });
  document.getElementById("counter")!.innerHTML = String(nextValue?.value ?? "unset");
});

components.MessageTable.update$.subscribe((update) => {
  console.log("Message received", update);
  const [nextValue] = update.value;

  const ele = document.getElementById("chat-output")!;
  ele.innerHTML = ele.innerHTML + `${new Date().toLocaleString()}: ${nextValue?.value}\n`;
});

// Just for demonstration purposes: we create a global function that can be
// called to invoke the Increment system contract via the world. (See IncrementSystem.sol.)
(window as any).increment = async () => {
  const tx = await worldContract.write.increment();

  console.log("increment tx", tx);
  console.log("increment result", await waitForTransaction(tx));
};

(window as any).willRevert = async () => {
  // set gas limit so we skip estimation and can test tx revert
  const tx = await worldContract.write.willRevert({ gas: 100000n });

  console.log("willRevert tx", tx);
  console.log("willRevert result", await waitForTransaction(tx));
};

(window as any).sendMessage = async () => {
  const input = document.getElementById("chat-input") as HTMLInputElement;
  const msg = input.value;
  if (!msg || msg.length === 0) return;

  input.value = "";

  const tx = await worldContract.write.sendMessage([msg]);

  console.log("sendMessage tx", tx);
  console.log("sendMessage result", await waitForTransaction(tx));
};

document.getElementById("chat-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  (window as any).sendMessage();
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
    recsWorld: network.world,
  });
}
