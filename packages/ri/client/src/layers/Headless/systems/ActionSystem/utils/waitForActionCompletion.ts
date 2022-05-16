import { waitForComponentValueIn } from "../../../../../utils/components";
import { defineActionComponent } from "../../../components";
import { ActionState } from "../constants";

export function waitForActionCompletion(
  Action: ReturnType<typeof defineActionComponent>,
  actionId: string
): Promise<void> {
  return waitForComponentValueIn(Action, actionId, [
    { state: ActionState.Cancelled },
    { state: ActionState.Failed },
    { state: ActionState.Complete },
  ]);
}
