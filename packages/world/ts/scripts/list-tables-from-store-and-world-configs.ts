import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "../../mud.config";

console.log(
  JSON.stringify(
    [...Object.values(storeConfig.tables), ...Object.values(worldConfig.tables)]
      // Skip generic tables
      .filter((table) => !table.codegen.tableIdArgument)
      .map((table) => ({ name: table.name, id: table.tableId })),
  ),
);
