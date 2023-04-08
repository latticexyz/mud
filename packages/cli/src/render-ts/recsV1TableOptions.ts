import { StoreConfig } from "@latticexyz/config";
import { resolveAbiOrUserType } from "../render-solidity/userType.js";
import { schemaTypesToRecsTypeStrings } from "./schemaTypesToRecsTypeStrings.js";
import { RecsV1TableOptions } from "./types.js";

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
      fileSelector: tableData.fileSelector,
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
