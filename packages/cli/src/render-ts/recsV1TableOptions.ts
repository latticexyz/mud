import { StoreConfig } from "@latticexyz/store";
import { resolveAbiOrUserType } from "@latticexyz/store/codegen";
import { schemaTypesToRecsTypeStrings } from "./schemaTypesToRecsTypeStrings";
import { RecsV1TableOptions } from "./types";
import { SchemaTypeToAbiType } from "@latticexyz/schema-type/deprecated";
import { StaticAbiType } from "@latticexyz/schema-type";

export function getRecsV1TableOptions(config: StoreConfig): RecsV1TableOptions {
  const tableOptions = [];
  for (const tableName of Object.keys(config.tables)) {
    const tableData = config.tables[tableName];

    const fields = Object.keys(tableData.schema).map((name) => {
      const abiOrUserType = tableData.schema[name];
      const { schemaType } = resolveAbiOrUserType(abiOrUserType, config);

      const recsTypeString = schemaTypesToRecsTypeStrings[schemaType];

      return {
        recsTypeString,
        name,
      };
    });

    // WARNING: skip tables without a static tableId
    if (tableData.tableIdArgument) continue;
    const staticResourceData = {
      namespace: config.namespace,
      name: tableData.name,
    };

    // TODO: move user type -> abi type into our config expanding step rather than sprinkled everywhere (https://github.com/latticexyz/mud/issues/1201)
    const keySchema = Object.fromEntries(
      Object.entries(tableData.keySchema).map(([name, type]) => [
        name,
        SchemaTypeToAbiType[resolveAbiOrUserType(type, config).schemaType] as StaticAbiType,
      ])
    );
    const valueSchema = Object.fromEntries(
      Object.entries(tableData.schema).map(([name, type]) => [
        name,
        SchemaTypeToAbiType[resolveAbiOrUserType(type, config).schemaType],
      ])
    );

    tableOptions.push({
      tableName,
      keySchema,
      valueSchema,
      fields,
      staticResourceData,
    });
  }
  return {
    tables: tableOptions,
  };
}
