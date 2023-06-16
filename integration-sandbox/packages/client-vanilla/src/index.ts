import { setup } from "./mud/setup";

const {
  components,
  network: { worldSend, worldContract },
} = await setup();

console.log(`Setup finished, world address: ${worldContract.address}`);

// Components expose a stream that triggers when the component is updated.
components.NumberList.update$.subscribe((update) => {
  const [nextValue, prevValue] = update.value;
  console.log("List updated", update, { nextValue, prevValue });
  document.getElementById("list-length")!.innerHTML = String(nextValue?.value.length ?? "unset");
  document.getElementById("first-item")!.innerHTML = String(nextValue?.value[0] ?? "unset");
  document.getElementById("last-item")!.innerHTML = String(nextValue?.value.at(-1) ?? "unset");
});

export async function set(list: number[]) {
  const tx = await worldSend("set", [list, { gasLimit: 20_000_000 }]);

  console.log("set tx", tx);
  console.log("set result", await tx.wait());
}

export async function push(num: number) {
  const tx = await worldSend("push", [num]);

  console.log("push tx", tx);
  console.log("push result", await tx.wait());
}

export async function pushRange(start: number, end: number) {
  const tx = await worldSend("pushRange", [start, end, { gasLimit: 20_000_000 }]);

  console.log("pushRange tx", tx);
  console.log("pushRange result", await tx.wait());
}

export async function pop() {
  const tx = await worldSend("pop", []);

  console.log("push tx", tx);
  console.log("push result", await tx.wait());
}
