import { Table } from "@latticexyz/store";
import { TableToComponent, tableToComponent } from "./tableToComponent";
import { mapObject } from "@latticexyz/common/utils";
import { World } from "@latticexyz/recs";

export type TablesToComponents<tables extends Record<string, Table>> = {
  [tableName in keyof tables]: TableToComponent<tables[tableName]>;
};

export function tablesToComponents<tables extends Record<string, Table>>(
  world: World,
  tables: tables
): TablesToComponents<tables> {
  return mapObject(tables, (table) => tableToComponent(world, table));
}
