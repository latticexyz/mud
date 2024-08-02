import { Tables } from "@latticexyz/config";
import { debug } from "./debug";
import { World as RecsWorld, getComponentValue, hasComponent, removeComponent, setComponent } from "@latticexyz/recs";
import { defineInternalComponents } from "./defineInternalComponents";
import { getTableEntity } from "./getTableEntity";
import { hexToResource, resourceToLabel, spliceHex } from "@latticexyz/common";
import { decodeValueArgs } from "@latticexyz/protocol-parser/internal";
import { Hex, size } from "viem";
import { isTableRegistrationLog } from "../isTableRegistrationLog";
import { logToTable } from "../logToTable";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";
import { StorageAdapter, StorageAdapterBlock } from "../common";
import { singletonEntity } from "./singletonEntity";
import { tablesToComponents } from "./tablesToComponents";
import { merge } from "@ark/util";

export type CreateStorageAdapterOptions<tables extends Tables> = {
  world: RecsWorld;
  tables: tables;
  shouldSkipUpdateStream?: () => boolean;
};

export type CreateStorageAdapterResult<tables extends Tables> = {
  storageAdapter: StorageAdapter;
  components: merge<tablesToComponents<tables>, ReturnType<typeof defineInternalComponents>>;
};

export function createStorageAdapter<tables extends Tables>({
  world,
  tables,
  shouldSkipUpdateStream,
}: CreateStorageAdapterOptions<tables>): CreateStorageAdapterResult<tables> {
  world.registerEntity({ id: singletonEntity });

  const components = {
    ...tablesToComponents(world, tables),
    ...defineInternalComponents(world),
  };

  async function recsStorageAdapter({ logs }: StorageAdapterBlock): Promise<void> {
    const newTables = logs.filter(isTableRegistrationLog).map(logToTable);
    for (const newTable of newTables) {
      const tableEntity = getTableEntity(newTable);
      if (hasComponent(components.RegisteredTables, tableEntity)) {
        console.warn("table already registered, ignoring", {
          newTable,
          existingTable: getComponentValue(components.RegisteredTables, tableEntity)?.table,
        });
      } else {
        setComponent(
          components.RegisteredTables,
          tableEntity,
          { table: newTable },
          { skipUpdateStream: shouldSkipUpdateStream?.() },
        );
      }
    }

    for (const log of logs) {
      const { namespace, name } = hexToResource(log.args.tableId);
      const table = getComponentValue(
        components.RegisteredTables,
        getTableEntity({ address: log.address, namespace, name }),
      )?.table;
      if (!table) {
        debug(`skipping update for unknown table: ${resourceToLabel({ namespace, name })} at ${log.address}`);
        continue;
      }

      const component = world.components.find((c) => c.id === table.tableId);
      if (!component) {
        debug(
          `skipping update for unknown component: ${table.tableId} (${resourceToLabel({
            namespace,
            name,
          })}). Available components: ${Object.keys(components)}`,
        );
        continue;
      }

      const entity = hexKeyTupleToEntity(log.args.keyTuple);

      if (log.eventName === "Store_SetRecord") {
        const value = decodeValueArgs(table.valueSchema, log.args);
        debug("setting component", {
          namespace: table.namespace,
          name: table.name,
          entity,
          value,
        });
        setComponent(
          component,
          entity,
          {
            ...value,
            __staticData: log.args.staticData,
            __encodedLengths: log.args.encodedLengths,
            __dynamicData: log.args.dynamicData,
          },
          { skipUpdateStream: shouldSkipUpdateStream?.() },
        );
      } else if (log.eventName === "Store_SpliceStaticData") {
        // TODO: add tests that this works when no record had been set before
        const previousValue = getComponentValue(component, entity);
        const previousStaticData = (previousValue?.__staticData as Hex) ?? "0x";
        const newStaticData = spliceHex(previousStaticData, log.args.start, size(log.args.data), log.args.data);
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
        setComponent(
          component,
          entity,
          {
            ...newValue,
            __staticData: newStaticData,
          },
          { skipUpdateStream: shouldSkipUpdateStream?.() },
        );
      } else if (log.eventName === "Store_SpliceDynamicData") {
        // TODO: add tests that this works when no record had been set before
        const previousValue = getComponentValue(component, entity);
        const previousDynamicData = (previousValue?.__dynamicData as Hex) ?? "0x";
        const newDynamicData = spliceHex(previousDynamicData, log.args.start, log.args.deleteCount, log.args.data);
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
        setComponent(
          component,
          entity,
          {
            ...newValue,
            __encodedLengths: log.args.encodedLengths,
            __dynamicData: newDynamicData,
          },
          { skipUpdateStream: shouldSkipUpdateStream?.() },
        );
      } else if (log.eventName === "Store_DeleteRecord") {
        debug("deleting component", {
          namespace: table.namespace,
          name: table.name,
          entity,
        });
        removeComponent(component, entity, { skipUpdateStream: shouldSkipUpdateStream?.() });
      }
    }
  }

  return { storageAdapter: recsStorageAdapter, components };
}
