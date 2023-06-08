import { MUDCoreConfig } from "@latticexyz/config";
import { SyncHook } from "tapable";

export type StoreHooks = {
  preTablegen: SyncHook<MUDCoreConfig>;
};
