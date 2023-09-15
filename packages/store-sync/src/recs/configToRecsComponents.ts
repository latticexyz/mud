import { StoreConfig } from "@latticexyz/store";
import { SchemaAbiType } from "@latticexyz/schema-type";
import { tableIdToHex } from "@latticexyz/common";
import { World, defineComponent } from "@latticexyz/recs";
import { ConfigToRecsComponents } from "./common";
import { schemaAbiTypeToRecsType } from "./schemaAbiTypeToRecsType";

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
          Object.entries(table.valueSchema).map(([fieldName, schemaAbiType]) => [
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
            valueSchema: table.valueSchema,
          },
        }
      ),
    ])
  ) as ConfigToRecsComponents<TConfig>;
}
