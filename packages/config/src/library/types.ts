import { SyncHook } from "tapable";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MUDCoreUserConfig {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MUDCoreConfig {}

export type MUDConfigExtender = (config: MUDCoreConfig) => Record<string, unknown>;

export interface MUDDefaultHooks {
  beforeAll: SyncHook<MUDCoreUserConfig>;
  afterAll: SyncHook<MUDCoreConfig>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MUDHooks extends MUDDefaultHooks {}
