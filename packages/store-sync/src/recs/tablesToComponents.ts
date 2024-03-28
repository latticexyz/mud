import { Table } from "@latticexyz/config";
import { TableToComponent, tableToComponent } from "./tableToComponent";
import { mapObject } from "@latticexyz/common/utils";
import { World } from "@latticexyz/recs";

export type TablesToComponents<tables extends Record<string, Table>> = {
  [k in keyof tables]: TableToComponent<tables[k]>;
};

export function tablesToComponents<tables extends Record<string, Table>>(
  world: World,
  tables: tables,
): TablesToComponents<tables> {
  return mapObject(tables, (table) => tableToComponent(world, table));
}
