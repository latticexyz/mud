import { setup } from "./mud/setup";

const {
  network: {
    storeCache,
    network: { blockNumber$ },
    worldSend,
    worldContract,
    components: { LoadingState },
  },
} = await setup();

const _window = window as any;
_window.storeCache = storeCache;
_window.worldContract = worldContract;
_window.worldSend = worldSend;

// Update block number in the UI
blockNumber$.subscribe((blockNumber) => {
  const element = document.querySelector("#block");
  if (element) element.innerHTML = String(blockNumber);
});

// Update initial sync status in the UI
LoadingState.update$.subscribe((value) => {
  const syncState = value.value[0]?.state;
  const element = document.querySelector("#sync-state");
  if (element) element.innerHTML = String(syncState);
});
