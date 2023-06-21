import { setup } from "./mud/setup";

const {
  network: {
    storeCache,
    network: { blockNumber$ },
    worldContract,
  },
} = await setup();

const _window = window as any;
_window.storeCache = storeCache;
_window.worldContract = worldContract;

console.log("window", window);

// Update block number in the UI
blockNumber$.subscribe((blockNumber) => {
  const element = document.querySelector("#block");
  if (element) element.innerHTML = String(blockNumber);
});
