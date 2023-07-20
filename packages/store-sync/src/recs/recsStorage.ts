import { Address, getAddress } from "viem";
import { BlockLogsToStorageOptions, blockLogsToStorage } from "../blockLogsToStorage";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import {
  ComponentValue,
  Entity,
  Component as RecsComponent,
  Schema as RecsSchema,
  removeComponent,
  setComponent,
  updateComponent,
} from "@latticexyz/recs";
import { KeySchema, Table, TableName, TableNamespace, ValueSchema } from "../common";
import { isDefined } from "@latticexyz/common/utils";
import { TableId } from "@latticexyz/common";
import { schemaToDefaults } from "../schemaToDefaults";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";

// TODO: should we create components here from config rather than passing them in?
// TODO: should we store table schemas in RECS?

type TableKey = `${Address}:${TableNamespace}:${TableName}`;

function getTableKey(table: Pick<Table, "address" | "namespace" | "name">): TableKey {
  return `${getAddress(table.address)}:${table.namespace}:${table.name}`;
}

export function recsStorage<TConfig extends StoreConfig = StoreConfig>({
  components,
}: {
  components: Record<
    string,
    RecsComponent<RecsSchema, { contractId: string; keySchema: KeySchema; valueSchema: ValueSchema }>
  >;
  config?: TConfig;
}): BlockLogsToStorageOptions<TConfig> {
  // TODO: do we need to store block number?
  const storedTables = new Map<TableKey, Table>();

  const componentsByTableId = Object.fromEntries(
    Object.entries(components).map(([id, component]) => [component.metadata.contractId, component])
  );

  return {
    async registerTables({ tables }) {
      for (const table of tables) {
        // TODO: check if table exists already and skip/warn?
        storedTables.set(getTableKey(table), table);
      }
    },
    async getTables({ tables }) {
      // TODO: fetch schema from RPC if table not found?
      return tables.map((table) => storedTables.get(getTableKey(table))).filter(isDefined);
    },
    async storeOperations({ operations }) {
      for (const operation of operations) {
        const table = storedTables.get(
          getTableKey({
            address: operation.log.address,
            namespace: operation.namespace,
            name: operation.name,
          })
        );
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
