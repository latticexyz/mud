import { ZodError } from "zod";
import { defineMUDPlugin, fromZodErrorCustom, resolveTableId } from "@latticexyz/config";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig } from "../../library";
import { zSnapSyncPluginConfig } from "./config";
import { SnapSyncConfig, SnapSyncUserConfig } from "./types";

function expandConfig<C extends SnapSyncUserConfig>(config: C): SnapSyncConfig {
  // This function gets called within mudConfig.
  // The call order of config extenders depends on their order in the `plugins` config option.
  // Any config validation and transformation should be placed here.
  const parsedConfig = (() => {
    try {
      return zSnapSyncPluginConfig.parse(config);
    } catch (error) {
      if (error instanceof ZodError) {
        throw fromZodErrorCustom(error, "SnapSync Validation Error");
      } else {
        throw error;
      }
    }
  })();

  // TODO use world hook to not rely on plugin order, and simplify types
  if (parsedConfig.snapSync) {
    const worldConfig = parsedConfig as unknown as WorldConfig;
    const storeConfig = parsedConfig as unknown as StoreConfig;
    const tableNames = Object.entries(storeConfig.tables)
      .filter(([_, t]) => !t.ephemeral)
      .map(([name, _]) => name);
    const newModules = tableNames.map((tableName) => {
      return {
        name: "KeysInTableModule",
        root: true,
        args: [resolveTableId(tableName)],
      };
    });

    parsedConfig.modules = [
      ...worldConfig.modules,
      {
        name: "SnapSyncModule",
        root: true,
        args: [],
      },
      ...newModules,
    ];
  }

  return parsedConfig;
}

export const snapSyncPlugin = defineMUDPlugin({
  id: "snap-sync",
  expandConfig,
} as const);
