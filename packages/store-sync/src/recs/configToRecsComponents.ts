import { StoreConfig } from "@latticexyz/store";
import { SchemaAbiType } from "@latticexyz/schema-type";
import { resourceIdToHex } from "@latticexyz/common";
import { World, defineComponent, Type } from "@latticexyz/recs";
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
        {
          ...Object.fromEntries(
            Object.entries(table.valueSchema).map(([fieldName, schemaAbiType]) => [
              fieldName,
              schemaAbiTypeToRecsType[schemaAbiType as SchemaAbiType],
            ])
          ),
          __staticData: Type.OptionalString,
          __encodedLengths: Type.OptionalString,
          __dynamicData: Type.OptionalString,
        },
        {
          // TODO: support table namespaces https://github.com/latticexyz/mud/issues/994
          id: resourceIdToHex({
            type: table.offchainOnly ? "offchainTable" : "table",
            namespace: config.namespace,
            name: tableName,
          }),
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
