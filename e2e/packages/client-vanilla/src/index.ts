import { Component, Entity, getComponentValue } from "@latticexyz/recs";
import { setup } from "./mud/setup";

const {
  network: { components, latestBlock$, worldContract, waitForTransaction },
} = await setup();

const _window = window as any;
_window.worldContract = worldContract;
_window.waitForTransaction = waitForTransaction;

_window.getComponentValue = (componentName: keyof typeof components, entity: Entity) =>
  getComponentValue(components[componentName] as Component, entity);

// Update block number in the UI
latestBlock$.subscribe((block) => {
  const element = document.querySelector("#block");
  if (element) element.innerHTML = String(block.number);
});

// Update initial sync status in the UI
components.SyncProgress.update$.subscribe((value) => {
  const syncStep = value.value[0]?.step;
  const element = document.querySelector("#sync-step");
  if (element) element.innerHTML = String(syncStep);
});
