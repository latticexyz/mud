import { Entity } from "../types";
import { ActionState } from "./constants";
import { defineActionComponent } from "./defineActionComponent";
import { waitForComponentValueIn } from "./waitForComponentValueIn";

export async function waitForActionCompletion(
  Action: ReturnType<typeof defineActionComponent>,
  entity: Entity
): Promise<void> {
  return waitForComponentValueIn(Action, entity, [
    { state: ActionState.Cancelled },
    { state: ActionState.Failed },
    { state: ActionState.Complete },
  ]);
}
