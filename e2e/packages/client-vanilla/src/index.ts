import { Component, Entity, getComponentValue } from "@latticexyz/recs";
import { TableId } from "@latticexyz/common";
import { setup } from "./mud/setup";
import { encodeEntity } from "@latticexyz/store-sync/recs";

const {
  network: { components, latestBlock$, worldContract, waitForTransaction },
} = await setup();

const _window = window as any;
_window.worldContract = worldContract;
_window.waitForTransaction = waitForTransaction;

_window.getComponentValue = (componentName: keyof typeof components, entity: Entity) => {
  // TODO: do we need to serialize this?
  return getComponentValue(components[componentName] as Component, entity);
};

_window.getRecord = (namespace: string, tableName: string, key: Record<string, any>) => {
  const component = Object.values(components).find((c) => c.id === TableId.toHex(namespace, tableName));
  if (!component) {
    throw new Error(`No component found for table ${namespace}:${tableName}`);
  }

  return getComponentValue(component as Component, encodeEntity(component.metadata.keySchema, key));
};

// Update block number in the UI
latestBlock$.subscribe((block) => {
  const element = document.querySelector("#block");
  if (element) element.innerHTML = String(block.number);
});

// Update initial sync status in the UI
components.SyncProgress.update$.subscribe((value) => {
  const syncStep = value.value[0]?.step;
  const element = document.querySelector("#sync-state");
  if (element) element.innerHTML = String(syncStep);
});
