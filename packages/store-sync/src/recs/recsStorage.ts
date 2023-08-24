import { BlockLogsToStorageOptions } from "../blockLogsToStorage";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import {
  ComponentValue,
  Component as RecsComponent,
  Schema as RecsSchema,
  getComponentValue,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { isDefined } from "@latticexyz/common/utils";
import { schemaToDefaults } from "../schemaToDefaults";
import { defineInternalComponents } from "./defineInternalComponents";
import { getTableEntity } from "./getTableEntity";
import { StoreComponentMetadata } from "./common";
import { tableIdToHex } from "@latticexyz/common";
import { encodeEntity } from "./encodeEntity";
import { abiTypesToSchema, decodeRecord, encodeRecord } from "@latticexyz/protocol-parser";
import { DynamicPrimitiveType, StaticPrimitiveType } from "@latticexyz/schema-type";
import { concat, size, slice } from "viem";

export function recsStorage<TConfig extends StoreConfig = StoreConfig>({
  components,
}: {
  components: ReturnType<typeof defineInternalComponents> &
    Record<string, RecsComponent<RecsSchema, StoreComponentMetadata>>;
  config?: TConfig;
}): BlockLogsToStorageOptions<TConfig> {
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
        } else if (operation.type === "SpliceRecord") {
          const schema = abiTypesToSchema(Object.values(table.valueSchema));
          const oldValueTuple = Object.values(
            getComponentValue(component, entity) ?? schemaToDefaults(table.valueSchema)
          );
          const oldRecord = encodeRecord(schema, oldValueTuple as (StaticPrimitiveType | DynamicPrimitiveType)[]);
          const end = operation.start + operation.deleteCount;
          const newRecord = concat([
            slice(oldRecord, 0, operation.start),
            operation.data,
            end >= size(oldRecord) ? "0x" : slice(oldRecord, end),
          ]);
          const newValueTuple = decodeRecord(schema, newRecord);

          const fieldNames = Object.keys(table.valueSchema);
          const value = Object.fromEntries(fieldNames.map((name, i) => [name, newValueTuple[i]]));

          debug("setting component (splice)", tableId, entity, newRecord);
          setComponent(component, entity, value);
        } else if (operation.type === "DeleteRecord") {
          debug("deleting component", tableId, entity);
          removeComponent(component, entity);
        }
      }
    },
  } as BlockLogsToStorageOptions<TConfig>;
}
