import { BlockLogsToStorageOptions } from "../blockLogsToStorage";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import {
  ComponentValue,
  Entity,
  ComponentPlus as RecsComponent,
  Schema as RecsSchema,
  getComponentValue,
  removeComponent,
  setComponent,
  updateComponent,
} from "@latticexyz/recs";
import { isDefined } from "@latticexyz/common/utils";
import { TableId } from "@latticexyz/common/deprecated";
import { schemaToDefaults } from "../schemaToDefaults";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";
import { defineInternalComponents } from "./defineInternalComponents";
import { getTableKey } from "./getTableKey";
import { StoreComponentMetadata } from "./common";

// TODO: should we create components here from config rather than passing them in?

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
        setComponent(components.TableMetadata, getTableKey(table) as Entity, { table });
      }
    },
    async getTables({ tables }) {
      // TODO: fetch schema from RPC if table not found?
      return tables
        .map((table) => getComponentValue(components.TableMetadata, getTableKey(table) as Entity)?.table)
        .filter(isDefined);
    },
    async storeOperations({ operations }) {
      for (const operation of operations) {
        const table = getComponentValue(
          components.TableMetadata,
          getTableKey({
            address: operation.log.address,
            namespace: operation.namespace,
            name: operation.name,
          }) as Entity
        )?.table;
        if (!table) {
          debug(
            `skipping update for unknown table: ${operation.namespace}:${operation.name} at ${operation.log.address}`
          );
          continue;
        }

        const tableId = new TableId(operation.namespace, operation.name).toString();
        const component = componentsByTableId[operation.log.args.table];
        if (!component) {
          debug(`skipping update for unknown component: ${tableId}. Available components: ${Object.keys(components)}`);
          continue;
        }

        const entity = hexKeyTupleToEntity(operation.log.args.key);

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
  } as BlockLogsToStorageOptions<TConfig>;
}
