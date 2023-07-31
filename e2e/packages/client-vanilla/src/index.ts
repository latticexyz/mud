import { setup } from "./mud/setup";

const {
  network: {
    components: { SyncProgress },
    latestBlock$,
    worldContract,
    waitForTransaction,
  },
} = await setup();

const _window = window as any;
_window.worldContract = worldContract;
_window.waitForTransaction = waitForTransaction;

// Update block number in the UI
latestBlock$.subscribe((block) => {
  const element = document.querySelector("#block");
  if (element) element.innerHTML = String(block.number);
});

// Update initial sync status in the UI
SyncProgress.update$.subscribe((value) => {
  const syncStep = value.value[0]?.step;
  const element = document.querySelector("#sync-state");
  if (element) element.innerHTML = String(syncStep);
});
