import { EntityIndex } from "@latticexyz/recs";
import { waitForComponentValueIn } from "../../../../../utils/components";
import { defineActionComponent } from "../../../components";
import { ActionState } from "../constants";

export async function waitForActionCompletion(
  Action: ReturnType<typeof defineActionComponent>,
  entity: EntityIndex
): Promise<void> {
  return waitForComponentValueIn(Action, entity, [
    { state: ActionState.Cancelled },
    { state: ActionState.Failed },
    { state: ActionState.Complete },
  ]);
}
