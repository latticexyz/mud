import { Entity } from "@latticexyz/recs";
import { defineActionComponent } from "../../../components";
import { waitForComponentValueIn } from "../../../utils";
import { ActionState } from "../constants";

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
