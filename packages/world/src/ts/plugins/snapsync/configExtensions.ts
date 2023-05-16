import { extendMUDCoreConfig, resolveTableId } from "@latticexyz/config";
import { zPluginWorldConfig } from "../../../../ts/library";
import { zSnapSyncPluginConfig } from "./plugin";
import type { TableConfig } from "@latticexyz/store";

extendMUDCoreConfig((config) => {
  const modifiedConfig = { ...config } as Record<string, unknown>;
  const snapSyncConfig = zSnapSyncPluginConfig.parse(config);

  if (snapSyncConfig.snapSync) {
    const worldConfig = zPluginWorldConfig.parse(config);
    const tableNames = Object.entries(worldConfig.tables as TableConfig)
      .filter(([_, t]) => !t.ephemeral)
      .map(([name, _]) => name);
    const newModules = tableNames.map((tableName) => {
      return {
        name: "KeysInTableModule",
        root: true,
        args: [resolveTableId(tableName)],
      };
    });

    modifiedConfig.modules = [
      ...worldConfig.modules,
      {
        name: "SnapSyncModule",
        root: true,
        args: [],
      },
      ...newModules,
    ];
  }

  return modifiedConfig;
});
