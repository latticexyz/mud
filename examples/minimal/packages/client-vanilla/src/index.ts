import { setup } from "./mud/setup";
import { mount as mountDevTools } from "@latticexyz/dev-tools";

const {
  components,
  network: { worldContract, waitForTransaction },
} = await setup();

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

mountDevTools();
