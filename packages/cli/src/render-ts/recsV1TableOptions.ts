import { StoreConfig, resolveAbiOrUserType } from "@latticexyz/store";
import { schemaTypesToRecsTypeStrings } from "./schemaTypesToRecsTypeStrings";
import { RecsV1TableOptions } from "./types";

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
      namespace: tableData.namespace,
      name: tableData.name,
    };

    tableOptions.push({
      tableName,
      fields,
      staticResourceData,
    });
  }
  return {
    tables: tableOptions,
  };
}
