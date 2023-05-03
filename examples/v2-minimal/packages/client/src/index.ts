import { setup } from "./mud/setup";

const { components, worldSend } = await setup();

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
  const tx = await worldSend("increment", []);

  console.log("increment tx", tx);
  console.log("increment result", await tx.wait());
};

(window as any).sendMessage = async () => {
  const input = document.getElementById("chat-input") as HTMLInputElement;
  const msg = input.value;
  if (!msg || msg.length === 0) return;

  input.value = "";

  const tx = await worldSend("sendMessage", [msg]);

  console.log("sendMessage tx", tx);
  console.log("sendMessage result", await tx.wait());
};

document.getElementById("chat-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  (window as any).sendMessage();
});
