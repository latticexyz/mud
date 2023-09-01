import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import {
  Component as RecsComponent,
  Schema as RecsSchema,
  getComponentValue,
  hasComponent,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { schemaToDefaults } from "../schemaToDefaults";
import { defineInternalComponents } from "./defineInternalComponents";
import { getTableEntity } from "./getTableEntity";
import { StoreComponentMetadata } from "./common";
import { hexToTableId } from "@latticexyz/common";
import { SchemaToPrimitives, ValueSchema, decodeValue, encodeValue } from "@latticexyz/protocol-parser";
import { concat, size, slice } from "viem";
import { StorageAdapter } from "../common";
import { isTableRegistrationLog } from "../isTableRegistrationLog";
import { logToTable } from "../logToTable";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";

export function recsStorage<TConfig extends StoreConfig = StoreConfig>({
  components,
}: {
  components: ReturnType<typeof defineInternalComponents> &
    Record<string, RecsComponent<RecsSchema, StoreComponentMetadata>>;
  config?: TConfig;
}): StorageAdapter {
  // TODO: do we need to store block number?

  const componentsByTableId = Object.fromEntries(
    Object.entries(components).map(([id, component]) => [component.id, component])
  );

  return async function storeLogs({ logs }) {
    const newTables = logs.filter(isTableRegistrationLog).map(logToTable);
    for (const newTable of newTables) {
      const tableEntity = getTableEntity(newTable);
      if (hasComponent(components.RegisteredTables, tableEntity)) {
        console.warn("table already registered, ignoring", {
          newTable,
          existingTable: getComponentValue(components.RegisteredTables, tableEntity)?.table,
        });
      } else {
        setComponent(components.RegisteredTables, tableEntity, { table: newTable });
      }
    }

    for (const log of logs) {
      const { namespace, name } = hexToTableId(log.args.table);
      const table = getComponentValue(
        components.RegisteredTables,
        getTableEntity({ address: log.address, namespace, name })
      )?.table;
      if (!table) {
        debug(`skipping update for unknown table: ${namespace}:${name} at ${log.address}`);
        continue;
      }

      const component = componentsByTableId[table.tableId];
      if (!component) {
        debug(
          `skipping update for unknown component: ${table.tableId}. Available components: ${Object.keys(components)}`
        );
        continue;
      }

      const entity = hexKeyTupleToEntity(log.args.key);

      if (log.eventName === "StoreSetRecord" || log.eventName === "StoreEphemeralRecord") {
        const value = decodeValue(table.valueSchema, log.args.data);
        debug("setting component", table.tableId, entity, value);
        setComponent(component, entity, value);
      } else if (log.eventName === "StoreSpliceRecord") {
        const previousValue = getComponentValue(component, entity);
        const previousData = encodeValue(
          table.valueSchema,
          (previousValue as SchemaToPrimitives<ValueSchema>) ?? schemaToDefaults(table.valueSchema)
        );
        const end = log.args.start + log.args.deleteCount;
        const newData = concat([
          slice(previousData, 0, log.args.start),
          log.args.data,
          end >= size(previousData) ? "0x" : slice(previousData, end),
        ]);
        const newValue = decodeValue(table.valueSchema, newData);
        debug("setting component via splice", table.tableId, entity, { newValue, previousValue });
        setComponent(component, entity, newValue);
      } else if (log.eventName === "StoreDeleteRecord") {
        debug("deleting component", table.tableId, entity);
        removeComponent(component, entity);
      }
    }
  };
}
