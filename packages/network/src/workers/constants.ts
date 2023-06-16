import { Entity } from "@latticexyz/recs";
import { Hex, pad } from "viem";

export enum SyncState {
  CONNECTING,
  INITIAL,
  LIVE,
}

export const SingletonID = pad("0x060d" as Hex, { size: 32 }) as Entity;

/** @deprecated Import SingletonID instead */
export const GodID = SingletonID;
