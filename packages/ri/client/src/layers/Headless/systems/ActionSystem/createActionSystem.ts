import {
  Components,
  World,
  createEntity,
  withValue,
  getComponentValue,
  OverridableComponent,
  Schema,
  overridableComponent,
  updateComponent,
  EntityID,
  EntityIndex,
  Component,
  removeComponent,
} from "@latticexyz/recs";
import { mapObject, awaitStreamValue } from "@latticexyz/utils";
import { ActionState } from "./constants";
import { ActionData, ActionRequest } from "./types";
import { defineActionComponent } from "../../components";
import { merge, Observable } from "rxjs";

export type ActionSystem = ReturnType<typeof createActionSystem>;

export function createActionSystem(
  world: World,
  Action: ReturnType<typeof defineActionComponent>,
  txReduced$: Observable<string>
) {
  // Components that scheduled actions depend on including pending updates
  const componentsWithOptimisticUpdates: { [id: string]: OverridableComponent<Schema> } = {};

  // ActionData contains requirements and execute logic of scheduled actions.
  // We also store the relevant subset of all componentsWithOptimisticUpdates in the action data,
  // to recheck requirements only if relevant components updated.
  const actionData = new Map<string, ActionData>();

  // Disposers of requirement check autoruns for all pending actions
  const disposer = new Map<string, { dispose: () => void }>();
  world.registerDisposer(() => {
    for (const { dispose } of disposer.values()) dispose();
  });

  /**
   * Maps all components in a given components map to the respective components including pending updates
   * @param components Components to be mapped to components including pending updates
   * @returns Components including pending updates
   */
  function withOptimisticUpdates<C extends Component>(component: C): C {
    const optimisticComponent = componentsWithOptimisticUpdates[component.id] || overridableComponent(component);

    // If the component is not tracked yet, add it to the map of overridable components
    if (!componentsWithOptimisticUpdates[component.id]) {
      componentsWithOptimisticUpdates[component.id] = optimisticComponent;
    }

    // Typescript can't know that the optimistic component with this id has the same type as C
    return optimisticComponent as unknown as C;
  }

  /**
   * Schedules an action. The action will be executed once its requirement is fulfilled.
   * Note: the requirement will only be rechecked automatically if the requirement is based on components
   * (or other mobx-observable values).
   * @param actionRequest Action to be scheduled
   * @returns index of the entity created for the action
   */
  function add<C extends Components, T>(actionRequest: ActionRequest<C, T>): EntityIndex | void {
    // Prevent the same actions from being scheduled multiple times
    if (world.entityToIndex.get(actionRequest.id) != null) {
      return console.warn(`Action with id ${actionRequest.id} is already requested.`);
    }

    // Set the action component
    const entityIndex = createEntity(
      world,
      [
        withValue(Action, {
          state: ActionState.Requested,
          on: actionRequest.on ? world.entities[actionRequest.on] : undefined,
        }),
      ],
      {
        id: actionRequest.id,
      }
    );

    // Add components that are not tracked yet to internal overridable component map.
    // Pending updates will be applied to internal overridable components.
    for (const [key, component] of Object.entries(actionRequest.components)) {
      if (!componentsWithOptimisticUpdates[key]) componentsWithOptimisticUpdates[key] = overridableComponent(component);
    }

    // Store relevant components with pending updates along the action's requirement and execution logic
    const action = {
      ...actionRequest,
      entityIndex,
      componentsWithOptimisticUpdates: mapObject(actionRequest.components, (c) => withOptimisticUpdates(c)),
    } as unknown as ActionData;
    actionData.set(action.id, action);

    // This subscriotion makes sure the action requirement is checked again every time
    // one of the referenced components changes or the pending updates map changes
    const subscription = merge(
      ...Object.values(action.componentsWithOptimisticUpdates).map((c) => c.update$)
    ).subscribe(() => checkRequirement(action));
    checkRequirement(action);
    disposer.set(action.id, { dispose: () => subscription?.unsubscribe() });

    return entityIndex;
  }

  /**
   * Checks the requirement of a given action and executes the action if the requirement is fulfilled
   * @param actionId ID of the action to check the requirement of
   * @returns void
   */
  function checkRequirement(action: ActionData) {
    // Only check requirements of requested actions
    if (getComponentValue(Action, action.entityIndex)?.state !== ActionState.Requested) return;

    // Check requirement on components including pending updates
    const requirementResult = action.requirement(action.componentsWithOptimisticUpdates);

    // Execute the action if the requirements are met
    if (requirementResult) executeAction(action, requirementResult);
  }

  /**
   * Executes the given action and sets the corresponding Action component
   * @param action ActionData of the action to be executed
   * @param requirementResult Result of the action's requirement function
   * @returns void
   */
  async function executeAction<T>(action: ActionData, requirementResult: T) {
    // Only execute actions that were requested before
    if (getComponentValue(Action, action.entityIndex)?.state !== ActionState.Requested) return;

    // Update the action state
    updateComponent(Action, action.entityIndex, { state: ActionState.Executing });

    // Set all pending updates of this action
    for (const { component, value, entity } of action.updates(
      action.componentsWithOptimisticUpdates,
      requirementResult
    )) {
      componentsWithOptimisticUpdates[component as string].addOverride(action.id, { entity, value });
    }

    try {
      // Execute the action
      const tx = await action.execute(requirementResult);

      // If the result includes a hash key (single tx) or hashes (multiple tx) key, wait for the transactions to complete before removing the pending actions
      if (tx) {
        // Wait for all tx events to be reduced
        updateComponent(Action, action.entityIndex, { state: ActionState.WaitingForTxEvents });
        const txReduced = awaitStreamValue(txReduced$, (v) => v === tx.hash);
        await Promise.all([tx.wait(), txReduced]);
      }

      updateComponent(Action, action.entityIndex, { state: ActionState.Complete });
    } catch (e) {
      updateComponent(Action, action.entityIndex, { state: ActionState.Failed });
    }

    // After the action is done executing (failed or completed), remove its actionData and remove the Action component
    remove(action.id);
  }

  /**
   * Cancels the action with the given ID if it is in the "Requested" state.
   * @param actionId ID of the action to be cancelled
   * @returns void
   */
  function cancel(actionId: EntityID): boolean {
    const action = actionData.get(actionId);
    if (!action || getComponentValue(Action, action.entityIndex)?.state !== ActionState.Requested) {
      console.warn(`Action ${actionId} was not found or is not in the "Requested" state.`);
      return false;
    }
    updateComponent(Action, action.entityIndex, { state: ActionState.Cancelled });
    remove(actionId);
    return true;
  }

  /**
   * Removes actionData disposer of the action with the given ID and removes its pending updates.
   * @param actionId ID of the action to be removed
   */
  function remove(actionId: EntityID) {
    const action = actionData.get(actionId);
    if (!action) throw new Error("Trying to remove an action that does not exist.");

    // Remove this action's pending updates
    for (const component of Object.values(componentsWithOptimisticUpdates)) {
      component.removeOverride(actionId);
    }

    // Remove this action's autorun and corresponding disposer
    disposer.get(actionId)?.dispose();
    disposer.delete(actionId);

    // Remove the action data
    actionData.delete(actionId);

    // Remove the action entity after some time
    const actionIndex = world.entityToIndex.get(actionId);
    actionIndex != null && setTimeout(() => removeComponent(Action, actionIndex), 5000);
  }

  return { add, cancel, withOptimisticUpdates };
}
