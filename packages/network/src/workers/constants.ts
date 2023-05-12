import { Entity } from "@latticexyz/recs";

export enum SyncState {
  CONNECTING,
  INITIAL,
  LIVE,
}

export const SingletonID = "0x060d" as Entity;

/** @deprecated Import SingletonID instead */
export const GodID = SingletonID;
