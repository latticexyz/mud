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
import { decodeValueArgs, readHex, staticDataLength } from "@latticexyz/protocol-parser";
import { Hex, concatHex } from "viem";
import { StorageAdapter } from "../common";
import { isTableRegistrationLog } from "../isTableRegistrationLog";
import { logToTable } from "../logToTable";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";
import { assertExhaustive } from "@latticexyz/common/utils";
import { isStaticAbiType } from "@latticexyz/schema-type";

export function recsStorage<TConfig extends StoreConfig = StoreConfig>({
  components,
}: {
  // TODO: switch to RECS world so we can fetch components from current list in case new components are registered later
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
          `skipping update for unknown component: ${table.tableId} (${table.namespace}:${
            table.name
          }). Available components: ${Object.keys(components)}`
        );
        continue;
      }

      const entity = hexKeyTupleToEntity(log.args.key);

      if (log.eventName === "StoreSetRecord" || log.eventName === "StoreEphemeralRecord") {
        const value = decodeValueArgs(table.valueSchema, log.args);
        debug("setting component", {
          namespace: table.namespace,
          name: table.name,
          entity,
          value,
        });
        setComponent(component, entity, {
          ...value,
          __staticData: log.args.staticData,
          __encodedLengths: log.args.encodedLengths,
          __dynamicData: log.args.dynamicData,
        });
      } else if (log.eventName === "StoreSpliceStaticRecord") {
        // TODO: add tests that this works when no record had been set before
        const previousValue = getComponentValue(component, entity);
        const previousStaticData = (previousValue?.__staticData as Hex) ?? "0x";
        const start = log.args.start;
        const end = start + log.args.deleteCount;
        const newStaticData = concatHex([
          readHex(previousStaticData, 0, start),
          log.args.data,
          readHex(previousStaticData, end),
        ]);
        const newValue = decodeValueArgs(table.valueSchema, {
          staticData: newStaticData,
          encodedLengths: (previousValue?.__encodedLengths as Hex) ?? "0x",
          dynamicData: (previousValue?.__dynamicData as Hex) ?? "0x",
        });
        debug("setting component via splice static", {
          namespace: table.namespace,
          name: table.name,
          entity,
          previousStaticData,
          newStaticData,
          previousValue,
          newValue,
        });
        setComponent(component, entity, {
          ...newValue,
          __staticData: newStaticData,
        });
      } else if (log.eventName === "StoreSpliceDynamicRecord") {
        // TODO: add tests that this works when no record had been set before
        const previousValue = getComponentValue(component, entity);
        const previousDynamicData = (previousValue?.__dynamicData as Hex) ?? "0x";
        const start = log.args.start;
        const end = start + log.args.deleteCount;
        const newDynamicData = concatHex([
          readHex(previousDynamicData, 0, start),
          log.args.data,
          readHex(previousDynamicData, end),
        ]);
        const newValue = decodeValueArgs(table.valueSchema, {
          staticData: (previousValue?.__staticData as Hex) ?? "0x",
          // TODO: handle unchanged encoded lengths
          encodedLengths: log.args.encodedLengths,
          dynamicData: newDynamicData,
        });
        debug("setting component via splice dynamic", {
          namespace: table.namespace,
          name: table.name,
          entity,
          previousDynamicData,
          newDynamicData,
          previousValue,
          newValue,
        });
        setComponent(component, entity, {
          ...newValue,
          __encodedLengths: log.args.encodedLengths,
          __dynamicData: newDynamicData,
        });
      } else if (log.eventName === "StoreDeleteRecord") {
        debug("deleting component", {
          namespace: table.namespace,
          name: table.name,
          entity,
        });
        removeComponent(component, entity);
      } else {
        assertExhaustive(log.eventName);
      }
    }
  };
}
