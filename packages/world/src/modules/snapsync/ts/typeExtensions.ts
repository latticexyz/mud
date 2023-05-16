import "@latticexyz/store/register";
import { WorldConfig, WorldUserConfig } from "../../../../ts/library";

interface SnapSyncConfig {
  snapSync: boolean;
}

declare module "@latticexyz/config" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreUserConfig extends WorldUserConfig, SnapSyncConfig {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreConfig extends WorldConfig, SnapSyncConfig {}
}
