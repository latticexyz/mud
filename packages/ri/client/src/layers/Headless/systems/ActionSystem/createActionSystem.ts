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
} from "@latticexyz/recs";
import { mapObject, awaitStreamValue } from "@latticexyz/utils";
import { autorun } from "mobx";
import { ActionState } from "./constants";
import { ActionData, ActionRequest } from "./types";
import { defineActionComponent } from "../../components";
import { Observable } from "rxjs";

export function createActionSystem(
  world: World,
  Action: ReturnType<typeof defineActionComponent>,
  txReduced$: Observable<string>
) {
  // Components that scheduled actions depend on including pending updates
  const componentsWithPendingUpdates: { [key: string]: OverridableComponent<Schema> } = {};

  // ActionData contains requirements and execute logic of scheduled actions.
  // We also store the relevant subset of all componentsWithPendingUpdates in the action data,
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
  function withPendingUpdates<C extends Components>(components: C): C {
    return mapObject(components, (_, key) => componentsWithPendingUpdates[key as string]) as unknown as C;
  }

  /**
   * Schedules an action. The action will be executed once its requirement is fulfilled.
   * Note: the requirement will only be rechecked automatically if the requirement is based on components
   * (or other mobx-observable values).
   * @param actionRequest Action to be scheduled
   */
  function add<C extends Components, T>(actionRequest: ActionRequest<C, T>) {
    // Prevent the same actions from being scheduled multiple times
    if (getComponentValue(Action, actionRequest.id)) {
      return console.warn(`Action with id ${actionRequest.id} is already requested.`);
    }

    // Set the action component
    createEntity(
      world,
      [
        withValue(Action, {
          state: ActionState.Requested,
          on: actionRequest.on ?? null,
        }),
      ],
      {
        id: actionRequest.id,
      }
    );

    // Add components that are not tracked yet to internal overridable component map.
    // Pending updates will be applied to internal overridable components.
    for (const [key, component] of Object.entries(actionRequest.components)) {
      if (!componentsWithPendingUpdates[key]) componentsWithPendingUpdates[key] = overridableComponent(component);
    }

    // Store relevant components with pending updates along the action's requirement and execution logic
    const action = { ...actionRequest, componentsWithPendingUpdates: withPendingUpdates(actionRequest.components) };
    actionData.set(action.id, action as unknown as ActionData);

    // This autorun makes sure the action requirement is checked again every time
    // one of the referenced components changes or the pending updates map changes
    const dispose = autorun(() => {
      checkRequirement(action.id);
    });
    disposer.set(action.id, { dispose });
  }

  /**
   * Checks the requirement of a given action and executes the action if the requirement is fulfilled
   * @param actionId ID of the action to check the requirement of
   * @returns void
   */
  function checkRequirement(actionId: string) {
    // Only check requirements of requested actions
    if (getComponentValue(Action, actionId)?.state !== ActionState.Requested) return;

    const action = actionData.get(actionId);
    if (!action) throw new Error(`Action data of requested action not found: ${actionId}`);

    // Check requirement on components including pending updates
    const requirementResult = action.requirement(action.componentsWithPendingUpdates);

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
    if (getComponentValue(Action, action.id)?.state !== ActionState.Requested) return;

    // Update the action state
    updateComponent(Action, action.id, { state: ActionState.Executing });

    // Set all pending updates of this action
    for (const { component, value, entity } of action.updates(action.componentsWithPendingUpdates)) {
      componentsWithPendingUpdates[component as string].addOverride(action.id, { entity, value });
    }

    try {
      // Execute the action
      const result = await action.execute(requirementResult);

      // If the result includes txHashes, wait for the transactions to complete before removing the pending actions
      if (result?.txHashes) {
        // Wait for all tx events to be reduced
        updateComponent(Action, action.id, { state: ActionState.WaitingForTxEvents });
        await Promise.all(result.txHashes.map((txHash) => awaitStreamValue(txReduced$, (v) => v === txHash)));
      }

      updateComponent(Action, action.id, { state: ActionState.Complete });
    } catch (e) {
      updateComponent(Action, action.id, { state: ActionState.Failed });
    }

    // After the action is done executing (failed or completed), remove its actionData and remove the Action component
    remove(action.id);
  }

  /**
   * Cancels the action with the given ID if it is in the "Requested" state.
   * @param actionId ID of the action to be cancelled
   * @returns void
   */
  function cancel(actionId: string): boolean {
    if (getComponentValue(Action, actionId)?.state !== ActionState.Requested) {
      console.warn(`Action ${actionId} was not found or is not in the "Requested" state.`);
      return false;
    }
    updateComponent(Action, actionId, { state: ActionState.Cancelled });
    remove(actionId);
    return true;
  }

  /**
   * Removes actionData disposer of the action with the given ID and removes its pending updates.
   * @param actionId ID of the action to be removed
   */
  function remove(actionId: string) {
    const action = actionData.get(actionId);
    if (!action) throw new Error("Trying to remove an action that does not exist.");

    // Remove this action's pending updates
    for (const component of Object.values(componentsWithPendingUpdates)) {
      component.removeOverride(actionId);
    }

    // Remove this action's autorun and corresponding disposer
    disposer.get(actionId)?.dispose();
    disposer.delete(actionId);

    // Remove the action data
    actionData.delete(actionId);
  }

  return { add, cancel };
}
