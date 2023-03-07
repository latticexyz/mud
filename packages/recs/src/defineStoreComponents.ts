import { parseStoreConfig, StoreUserConfig } from "@latticexyz/cli/src/config/parseStoreConfig";
import { ContractComponents } from "@latticexyz/std-client";
import { World, Schema } from "./types";
import { Type } from "./constants";
import { defineComponent } from "./Component";

// TODO: figure out how to also translate types
export function defineStoreComponents(world: World, userConfig: StoreUserConfig): ContractComponents {
  const config = parseStoreConfig(userConfig);

  const components = Object.fromEntries(
    Object.entries(config.tables).map(([tableName, table]) => {
      // TODO: move this to a util to share this logic with cli/autogen
      const route = `${config.baseRoute}${table.route}/${tableName}`;
      // translate v2 schema type to v1 RECS generic type
      // TODO: do an actual mapping with nice TS type inference?
      const schema: Schema = Object.fromEntries(Object.entries(table.schema).map(([key, value]) => [key, Type.T]));
      const component = defineComponent(world, schema, { metadata: { contractId: route, table } });
      return [tableName, component];
    })
  );

  return components;
}
