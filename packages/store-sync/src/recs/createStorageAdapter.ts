import { Table, Tables } from "@latticexyz/config";
import { debug } from "./debug";
import { World as RecsWorld, getComponentValue, removeComponent, setComponent } from "@latticexyz/recs";
import { hexToResource, resourceToLabel, spliceHex } from "@latticexyz/common";
import { decodeValueArgs, getSchemaTypes, getValueSchema } from "@latticexyz/protocol-parser/internal";
import { Hex, size } from "viem";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";
import { StorageAdapter, StorageAdapterBlock } from "../common";
import { singletonEntity } from "./singletonEntity";
import { tablesToComponents } from "./tablesToComponents";

export type CreateStorageAdapterOptions<tables extends Tables = {}> = {
  world: RecsWorld;
  /** @deprecated Use `const components = tablesToComponents(world, tables)` instead. */
  tables: tables;
  shouldSkipUpdateStream?: () => boolean;
};

export type CreateStorageAdapterResult<tables extends Tables = {}> = {
  storageAdapter: StorageAdapter;
  /** @deprecated Use `const components = tablesToComponents(world, tables)` instead. */
  components: tablesToComponents<tables>;
};

export function createStorageAdapter<tables extends Tables = {}>({
  world,
  tables = {} as tables,
  shouldSkipUpdateStream,
}: CreateStorageAdapterOptions<tables>): CreateStorageAdapterResult<tables> {
  world.registerEntity({ id: singletonEntity });

  // kept for backwards compat
  const components = tablesToComponents(world, tables) as CreateStorageAdapterResult<tables>["components"];

  async function storageAdapter({ logs }: StorageAdapterBlock): Promise<void> {
    for (const log of logs) {
      const tableId = log.args.tableId;
      const component = world.components.find((c) => c.id === tableId);
      if (!component) {
        debug(
          `skipping update for unknown component: ${tableId} (${resourceToLabel(hexToResource(tableId))}). Available components: ${Object.keys(components)}`,
        );
        continue;
      }
      const table = component.metadata?.table as Table | undefined;
      if (!table) {
        debug(`skipping update for unknown table: ${resourceToLabel(hexToResource(tableId))} at ${log.address}`);
        continue;
      }

      const valueSchema = getSchemaTypes(getValueSchema(table));
      const entity = hexKeyTupleToEntity(log.args.keyTuple);

      if (log.eventName === "Store_SetRecord") {
        const value = decodeValueArgs(valueSchema, log.args);
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
        const newValue = decodeValueArgs(valueSchema, {
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
        const newValue = decodeValueArgs(valueSchema, {
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

  return {
    storageAdapter,
    /** @deprecated Use `const components = tablesToComponents(world, tables)` instead. */
    components,
  };
}
