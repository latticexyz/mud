import { StoreConfig } from "@latticexyz/store";
import { SchemaAbiType } from "@latticexyz/schema-type";
import { tableIdToHex } from "@latticexyz/common";
import { World, defineComponent } from "@latticexyz/recs";
import { ConfigToRecsComponents } from "./common";
import { schemaAbiTypeToRecsType } from "./schemaAbiTypeToRecsType";

// export function configToRecsComponents<TConfig extends StoreConfig>(
//   world: World,
//   config: TConfig
// ): ConfigToRecsComponents<TConfig> {
//   const components = Object.entries(config.tables).map(([tableName, table]) => {
//     const schema = Object.fromEntries(
//       Object.entries(table.schema).map(([fieldName, schemaAbiType]) => [
//         fieldName,
//         schemaAbiTypeToRecsType[schemaAbiType as SchemaAbiType],
//       ])
//     );
//     const options = {
//       id: tableIdToHex(config.namespace, tableName),
//       metadata: {
//         componentName: tableName,
//         tableName: `${config.namespace}:${tableName}`,
//         keySchema: table.keySchema,
//         valueSchema: table.schema,
//       },
//     };
//     const component = defineComponent(world, schema, options);
//     return [tableName, component];
//   });
//   return Object.fromEntries(components) as ConfigToRecsComponents<TConfig>;
// }
export function configToRecsComponents<TConfig extends StoreConfig>(
  world: World,
  config: TConfig
): ConfigToRecsComponents<TConfig> {
  return Object.fromEntries(
    Object.entries(config.tables).map(([tableName, table]) => [
      tableName,
      defineComponent(
        world,
        Object.fromEntries(
          Object.entries(table.schema).map(([fieldName, schemaAbiType]) => [
            fieldName,
            schemaAbiTypeToRecsType[schemaAbiType as SchemaAbiType],
          ])
        ),
        {
          id: tableIdToHex(config.namespace, tableName),
          metadata: {
            componentName: tableName,
            tableName: `${config.namespace}:${tableName}`,
            keySchema: table.keySchema,
            valueSchema: table.schema,
          },
        }
      ),
    ])
  ) as ConfigToRecsComponents<TConfig>;
}
