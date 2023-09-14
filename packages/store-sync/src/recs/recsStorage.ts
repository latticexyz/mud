import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import { World as RecsWorld, getComponentValue, hasComponent, removeComponent, setComponent } from "@latticexyz/recs";
import { defineInternalComponents } from "./defineInternalComponents";
import { getTableEntity } from "./getTableEntity";
import { hexToTableId, spliceHex } from "@latticexyz/common";
import { decodeValueArgs } from "@latticexyz/protocol-parser";
import { Hex } from "viem";
import { isTableRegistrationLog } from "../isTableRegistrationLog";
import { logToTable } from "../logToTable";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";
import { ConfigToRecsComponents } from "./common";
import { StorageAdapter, StorageAdapterBlock } from "../common";
import { configToRecsComponents } from "./configToRecsComponents";
import { singletonEntity } from "./singletonEntity";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";

export type RecsStorageOptions<TConfig extends StoreConfig = StoreConfig> = {
  world: RecsWorld;
  // TODO: make config optional?
  config: TConfig;
};

export type RecsStorageAdapter<TConfig extends StoreConfig = StoreConfig> = {
  storageAdapter: StorageAdapter;
  components: ConfigToRecsComponents<TConfig> &
    ConfigToRecsComponents<typeof storeConfig> &
    ConfigToRecsComponents<typeof worldConfig> &
    ReturnType<typeof defineInternalComponents>;
};

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

      const component = world.components.find((c) => c.id === table.tableId);
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
        const newStaticData = spliceHex(previousStaticData, log.args.start, log.args.deleteCount, log.args.data);
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
      }
    }
  }

  return { storageAdapter: recsStorageAdapter, components };
}
