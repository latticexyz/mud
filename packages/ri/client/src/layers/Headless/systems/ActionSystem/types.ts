import { Entity, Components, SchemaOf, Override } from "@latticexyz/recs";
import { ValueOf } from "@latticexyz/utils";

export type ComponentUpdate<C extends Components> = ValueOf<{
  [key in keyof C]: {
    component: key;
    entity: Entity;
    value: Override<SchemaOf<C[key]>>["value"];
  };
}>;

export interface ActionRequest<C extends Components, T> {
  // Identifier of this action. Will be used as entity id of the Action component.
  id: string;

  // Specify which entity this action is related to.
  on?: Entity;

  // Components this action depends on in requirement and updates
  components: C;

  // Action will be executed once requirement function returns a truthy value.
  // Requirement will be rechecked if any component values including pending updates
  // accessed in the requirement function change.
  requirement: (componentsWithPendingUpdates: C) => T | null;

  // Declare effects this action will have on components.
  // Used to compute component values with pending updates for other requested actions.
  updates: (componentsWithPendingUpdates: C, data: T) => ComponentUpdate<C>[];

  // Logic to be executed when the action is executed.
  // If txHashes are returned from the txQueue, the action will only be completed (and pending updates removed)
  // once all events from the given txHashes have been received and reduced.
  execute: (data: T) => Promise<{ hashes?: string[]; hash?: string }> | Promise<void> | void | undefined;
}

export type ActionData = ActionRequest<Components, unknown> & {
  componentsWithPendingUpdates: Components;
  entityIndex: number;
};
