import { EntityID, EntityIndex, Components, SchemaOf, Override } from "@latticexyz/recs";
import { ValueOf } from "@latticexyz/utils";
import { ContractTransaction } from "ethers";

export type ComponentUpdate<C extends Components> = ValueOf<{
  [key in keyof C]: {
    component: key;
    entity: EntityIndex;
    value: Override<SchemaOf<C[key]>>["value"];
  };
}>;

export type ActionRequest<C extends Components, T, M = undefined> = {
  // Identifier of this action. Will be used as entity id of the Action component.
  id: EntityID;

  // Specify which entity this action is related to.
  on?: EntityIndex;

  // Components this action depends on in requirement and updates
  components: C;

  // Action will be executed once requirement function returns a truthy value.
  // Requirement will be rechecked if any component value accessed in the requirement changes (including optimistic updates)
  requirement: (componentsWithOptimisticUpdates: C) => T | null;

  // Declare effects this action will have on components.
  // Used to compute component values with optimistic updates for other requested actions.
  updates: (componentsWithOptimisticUpdates: C, data: T) => ComponentUpdate<C>[];

  // Logic to be executed when the action is executed.
  // If txHashes are returned from the txQueue, the action will only be completed (and pending updates removed)
  // once all events from the given txHashes have been received and reduced.
  execute: (
    data: T
  ) =>
    | Promise<ContractTransaction>
    | Promise<void>
    | Promise<{ hash: string; wait(): Promise<unknown> }>
    | void
    | undefined;

  // Flag to set if the queue should wait for the underlying transaction to be confirmed (in addition to being reduced)
  awaitConfirmation?: boolean;

  // Metadata
  metadata?: M;
};

export type ActionData<M = undefined> = ActionRequest<Components, unknown, M> & {
  componentsWithOptimisticUpdates: Components;
  entityIndex: EntityIndex;
};
