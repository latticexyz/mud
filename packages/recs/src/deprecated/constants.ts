export enum ActionState {
  Requested = "Requested",
  Executing = "Executing",
  WaitingForTxEvents = "WaitingForTxEvents",
  Complete = "Complete",
  Failed = "Failed",
  Cancelled = "Cancelled",
  TxReduced = "TxReduced",
}
