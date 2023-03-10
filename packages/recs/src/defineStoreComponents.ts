import { parseStoreConfig, StoreUserConfig } from "@latticexyz/cli/src/config/parseStoreConfig";
import { TableId } from "@latticexyz/utils";
import { ContractComponents } from "@latticexyz/std-client";
import { World, Schema } from "./types";
import { Type } from "./constants";
import { defineComponent } from "./Component";

// TODO: figure out how to also translate TS types
export function defineStoreComponents(world: World, userConfig: StoreUserConfig): ContractComponents {
  const config = parseStoreConfig(userConfig);

  const components = Object.fromEntries(
    Object.entries(config.tables).map(([tableName, table]) => {
      // TODO: move this to a util to share this logic with cli/autogen
      const tableId = new TableId(config.namespace, table.fileSelector);
      // translate v2 schema type to v1 RECS generic type
      const schema: Schema = Object.fromEntries(
        Object.entries(table.schema).map(([fieldName, schemaType]) =>
          // TODO: infer TS types from schema types, map to real key names?
          [fieldName, Type.T]
        )
      );
      const component = defineComponent(world, schema, {
        metadata: { contractId: tableId.toHexString(), tableId: tableId.toString(), table },
      });
      return [tableName, component];
    })
  );

  return components;
}
