import { KeySchema, ValueSchema } from "../common";

export type StoreComponentMetadata = {
  keySchema: KeySchema;
  valueSchema: ValueSchema;
};

export enum SyncStep {
  INITIALIZE = "initialize",
  SNAPSHOT = "snapshot",
  RPC = "rpc",
  LIVE = "live",
}
