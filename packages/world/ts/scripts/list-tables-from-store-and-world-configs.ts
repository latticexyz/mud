import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "../../mud.config";

const storeTables = Object.values(storeConfig.namespaces).flatMap((namespace) => Object.values(namespace.tables));
const worldTables = Object.values(worldConfig.namespaces).flatMap((namespace) => Object.values(namespace.tables));

console.log(
  JSON.stringify(
    [...storeTables, ...worldTables]
      // Skip generic tables
      .filter((table) => !table.codegen.tableIdArgument)
      .map((table) => ({ name: table.name, id: table.tableId })),
  ),
);
