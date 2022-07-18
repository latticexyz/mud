export enum ActionState {
  Requested,
  Executing,
  WaitingForTxEvents,
  Complete,
  Failed,
  Cancelled,
}

export const ActionStateString = {
  [ActionState.Requested]: "Requested",
  [ActionState.Executing]: "Executing",
  [ActionState.WaitingForTxEvents]: "WaitingForTxEvents",
  [ActionState.Complete]: "Complete",
  [ActionState.Failed]: "Failed",
  [ActionState.Cancelled]: "Cancelled",
};
