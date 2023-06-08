import { SyncHook } from "tapable";
import { MUDDefaultHooks } from "./types";

export const defaultHooks: MUDDefaultHooks = {
  beforeAll: new SyncHook(["mudUserConfig"]),
  afterAll: new SyncHook(["mudConfig"]),
};
