import { Address, Hex, concatHex, getAddress } from "viem";
import { StoredTable, blockLogsToStorage } from "../blockLogsToStorage";
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
import { TableName, TableNamespace, schemaToDefaults } from "../common";
import { isDefined } from "@latticexyz/common/utils";
import { TableId } from "@latticexyz/common";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";

// TODO: should we create components here from config rather than passing them in?
// TODO: should we store table schemas in RECS?

type TableKey = `${Address}:${TableNamespace}:${TableName}`;

function getTableKey(table: Pick<StoredTable, "address" | "namespace" | "name">): TableKey {
  return `${getAddress(table.address)}:${table.namespace}:${table.name}`;
}

export function blockLogsToRecs<TConfig extends StoreConfig = StoreConfig>({
  recsComponents,
}: {
  recsComponents: Record<
    string,
    RecsComponent<
      RecsSchema,
      {
        contractId: string;
        keySchema: Record<string, StaticAbiType>;
        valueSchema: Record<string, SchemaAbiType>;
      }
    >
  >;
  config?: TConfig;
}): ReturnType<typeof blockLogsToStorage<TConfig>> {
  // TODO: do we need to store block number?
  const storedTables = new Map<TableKey, StoredTable>();

  const recsComponentsByTableId = Object.fromEntries(
    Object.entries(recsComponents).map(([id, component]) => [component.metadata.contractId, component])
  );

  return blockLogsToStorage({
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
        const component = recsComponentsByTableId[operation.log.args.table];
        if (!component) {
          debug(
            `skipping update for unknown component: ${tableId}. Available components: ${Object.keys(recsComponents)}`
          );
          continue;
        }

        const entity = `entity:${operation.log.args.key.join(":")}` as Entity;
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
          console.log("deleting component", tableId, entity);
          removeComponent(component, entity);
        }
      }
    },
  });
}
