import { setup } from "./mud/setup";
import { mount as mountDevUI } from "@latticexyz/dev-ui";

const { components, worldSend } = await setup();

// Components expose a stream that triggers when the component is updated.
components.CounterTable.update$.subscribe((update) => {
  const [nextValue, prevValue] = update.value;
  console.log("Counter updated", update, { nextValue, prevValue });
  document.getElementById("counter")!.innerHTML = String(nextValue?.value ?? "unset");
});

// Just for demonstration purposes: we create a global function that can be
// called to invoke the Increment system contract via the world. (See IncrementSystem.sol.)
(window as any).increment = async () => {
  const tx = await worldSend("increment", []);

  console.log("increment tx", tx);
  console.log("increment result", await tx.wait());
};

(window as any).willRevert = async () => {
  // set gas limit so we skip estimation and can test tx revert
  const tx = await worldSend("willRevert", [{ gasLimit: 100000 }]);

  console.log("willRevert tx", tx);
  console.log("willRevert result", await tx.wait());
};

mountDevUI();
