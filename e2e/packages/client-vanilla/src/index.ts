import { Component, Entity, getComponentValue } from "@latticexyz/recs";
import { setup } from "./mud/setup";
import { decodeEntity } from "@latticexyz/store-sync/recs";

const {
  network: { components, latestBlock$, worldContract, waitForTransaction },
} = await setup();

const _window = window as any;
_window.worldContract = worldContract;
_window.waitForTransaction = waitForTransaction;

_window.getComponentValue = (componentName: keyof typeof components, entity: Entity) =>
  getComponentValue(components[componentName] as Component, entity);

_window.getEntities = (componentName: keyof typeof components) => Array.from(components[componentName].entities());

_window.getKeys = (componentName: keyof typeof components) =>
  Array.from(components[componentName].entities()).map((entity) =>
    decodeEntity(components[componentName].metadata.keySchema, entity)
  );

// Update block number in the UI
latestBlock$.subscribe((block) => {
  const element = document.querySelector("#block");
  if (element) element.innerHTML = String(block.number);
});

// Update initial sync status in the UI
components.SyncProgress.update$.subscribe(({ value }) => {
  const syncStep = value[0]?.step;
  const element = document.querySelector("#sync-step");
  if (element) element.innerHTML = String(syncStep);
});
