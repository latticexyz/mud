import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import {
  ComponentValue,
  World as RecsWorld,
  getComponentValue,
  removeComponent,
  setComponent,
  updateComponent,
} from "@latticexyz/recs";
import { isDefined } from "@latticexyz/common/utils";
import { schemaToDefaults } from "../schemaToDefaults";
import { defineInternalComponents } from "./defineInternalComponents";
import { getTableEntity } from "./getTableEntity";
import { ConfigToRecsComponents } from "./common";
import { tableIdToHex } from "@latticexyz/common";
import { encodeEntity } from "./encodeEntity";
import { StorageAdapter } from "../common";
import { configToRecsComponents } from "./configToRecsComponents";
import { singletonEntity } from "./singletonEntity";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";

export type RecsStorageOptions<TConfig extends StoreConfig = StoreConfig> = {
  world: RecsWorld;
  config: TConfig;
};

export type RecsStorageAdapter<TConfig extends StoreConfig = StoreConfig> = {
  storageAdapter: StorageAdapter<TConfig>;
  components: ConfigToRecsComponents<TConfig> &
    ConfigToRecsComponents<typeof storeConfig> &
    ConfigToRecsComponents<typeof worldConfig> &
    ReturnType<typeof defineInternalComponents>;
};

// TODO: make config optional?
export function recsStorage<TConfig extends StoreConfig = StoreConfig>({
  world,
  config,
}: RecsStorageOptions<TConfig>): RecsStorageAdapter<TConfig> {
  world.registerEntity({ id: singletonEntity });

  const components = {
    ...configToRecsComponents(world, config),
    ...configToRecsComponents(world, storeConfig),
    ...configToRecsComponents(world, worldConfig),
    ...defineInternalComponents(world),
  };

  const storageAdapter = {
    async registerTables({ tables }) {
      for (const table of tables) {
        // TODO: check if table exists already and skip/warn?
        setComponent(components.RegisteredTables, getTableEntity(table), { table });
      }
    },
    async getTables({ tables }) {
      // TODO: fetch schema from RPC if table not found?
      return tables
        .map((table) => getComponentValue(components.RegisteredTables, getTableEntity(table))?.table)
        .filter(isDefined);
    },
    async storeOperations({ operations }) {
      for (const operation of operations) {
        const table = getComponentValue(
          components.RegisteredTables,
          getTableEntity({
            address: operation.address,
            namespace: operation.namespace,
            name: operation.name,
          })
        )?.table;
        if (!table) {
          debug(`skipping update for unknown table: ${operation.namespace}:${operation.name} at ${operation.address}`);
          continue;
        }

        const tableId = tableIdToHex(operation.namespace, operation.name);
        const component = world.components.find((component) => component.id === tableId);
        if (!component) {
          debug(`skipping update for unknown component: ${tableId}. Available components: ${Object.keys(components)}`);
          continue;
        }

        const entity = encodeEntity(table.keySchema, operation.key);

        if (operation.type === "SetRecord") {
          debug("setting component", tableId, entity, operation.value);
          setComponent(component, entity, operation.value as ComponentValue);
        } else if (operation.type === "SetField") {
          debug("updating component", tableId, entity, {
            [operation.fieldName]: operation.fieldValue,
          });
          updateComponent(
            component,
            entity,
            { [operation.fieldName]: operation.fieldValue } as ComponentValue,
            schemaToDefaults(table.valueSchema) as ComponentValue
          );
        } else if (operation.type === "DeleteRecord") {
          debug("deleting component", tableId, entity);
          removeComponent(component, entity);
        }
      }
    },
  } as StorageAdapter<TConfig>;

  return { storageAdapter, components };
}
