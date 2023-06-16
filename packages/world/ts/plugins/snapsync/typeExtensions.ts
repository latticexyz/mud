import "@latticexyz/store/register";

interface SnapSyncConfig {
  snapSync: boolean;
}

declare module "@latticexyz/config" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreUserConfig extends SnapSyncConfig {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreConfig extends SnapSyncConfig {}
}
