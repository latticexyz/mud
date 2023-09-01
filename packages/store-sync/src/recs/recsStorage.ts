import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import {
  ComponentValue,
  Component as RecsComponent,
  Schema as RecsSchema,
  getComponentValue,
  removeComponent,
  setComponent,
  updateComponent,
} from "@latticexyz/recs";
import { isDefined } from "@latticexyz/common/utils";
import { schemaToDefaults } from "../schemaToDefaults";
import { defineInternalComponents } from "./defineInternalComponents";
import { getTableEntity } from "./getTableEntity";
import { StoreComponentMetadata } from "./common";
import { tableIdToHex } from "@latticexyz/common";
import { encodeEntity } from "./encodeEntity";
import { StorageAdapter } from "../common";

export function recsStorage<TConfig extends StoreConfig = StoreConfig>({
  components,
}: {
  components: ReturnType<typeof defineInternalComponents> &
    Record<string, RecsComponent<RecsSchema, StoreComponentMetadata>>;
  config?: TConfig;
}): StorageAdapter<TConfig> {
  // TODO: do we need to store block number?

  const componentsByTableId = Object.fromEntries(
    Object.entries(components).map(([id, component]) => [component.id, component])
  );

  return {
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
        const component = componentsByTableId[tableId];
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
}
