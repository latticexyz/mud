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
import { defineInternalComponents } from "./defineInternalComponents";
import { getTableEntity } from "./getTableEntity";
import { StoreComponentMetadata } from "./common";
import { hexToTableId } from "@latticexyz/common";
import {
  SchemaToPrimitives,
  UNCHANGED_PACKED_COUNTER,
  ValueSchema,
  decodeValue,
  encodeValue,
  staticDataLength,
} from "@latticexyz/protocol-parser";
import { Hex, concatHex, padHex, size, sliceHex } from "viem";
import { StorageAdapter } from "../common";
import { isTableRegistrationLog } from "../isTableRegistrationLog";
import { logToTable } from "../logToTable";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";
import { schemaToDefaults } from "../schemaToDefaults";

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

  return async function recsStorageAdapter({ logs }) {
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
        setComponent(component, entity, { ...value, __data: log.args.data });
      } else if (log.eventName === "StoreSpliceRecord") {
        const previousData = (getComponentValue(component, entity)?.__data as Hex) ?? "0x";

        let newData = previousData;
        if (log.args.newDynamicLengths !== UNCHANGED_PACKED_COUNTER) {
          const start = Number(log.args.dynamicLengthsStart);
          const end = start + size(log.args.newDynamicLengths);
          newData = concatHex([
            padHex(sliceHex(newData, 0, start), { size: start, dir: "right" }),
            log.args.newDynamicLengths,
            size(newData) > end ? sliceHex(newData, end) : "0x",
          ]);
        }
        const start = log.args.start;
        const end = start + log.args.deleteCount;
        newData = concatHex([
          padHex(sliceHex(newData, 0, start), { size: start, dir: "right" }),
          log.args.data,
          end >= size(newData) ? "0x" : sliceHex(newData, end),
        ]);

        const newValue = decodeValue(table.valueSchema, newData);
        debug("setting component via splice", table.tableId, entity, { newValue, newData, previousData });
        setComponent(component, entity, { ...newValue, __data: newData });
      } else if (log.eventName === "StoreDeleteRecord") {
        debug("deleting component", table.tableId, entity);
        removeComponent(component, entity);
      }
    }
  };
}
