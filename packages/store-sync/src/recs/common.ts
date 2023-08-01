import { KeySchema, ValueSchema } from "@latticexyz/store";

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
