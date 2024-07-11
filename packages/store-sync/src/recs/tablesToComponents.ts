import { Table } from "@latticexyz/config";
import { TableToComponent, tableToComponent } from "./tableToComponent";
import { World } from "@latticexyz/recs";

export type TablesToComponents<tables extends Record<string, Table>> = {
  // TODO: update this to table label once available in the config output
  [label in keyof tables as tables[label]["name"]]: TableToComponent<tables[label]>;
};

export function tablesToComponents<tables extends Record<string, Table>>(
  world: World,
  tables: tables,
): TablesToComponents<tables> {
  return Object.fromEntries(
    Object.entries(tables).map(([, table]) => [table.name, tableToComponent(world, table)]),
  ) as never;
}
