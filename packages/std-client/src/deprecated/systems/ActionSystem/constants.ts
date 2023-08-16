export enum ActionState {
  Requested,
  Executing,
  WaitingForTxEvents,
  Complete,
  Failed,
  Cancelled,
  TxReduced,
}

export const ActionStateString = {
  [ActionState.TxReduced]: "TxReduced",
  [ActionState.Requested]: "Requested",
  [ActionState.Executing]: "Executing",
  [ActionState.WaitingForTxEvents]: "WaitingForTxEvents",
  [ActionState.Complete]: "Complete",
  [ActionState.Failed]: "Failed",
  [ActionState.Cancelled]: "Cancelled",
};
