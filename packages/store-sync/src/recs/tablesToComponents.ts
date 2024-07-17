import { Table } from "@latticexyz/config";
import { tableToComponent } from "./tableToComponent";
import { World } from "@latticexyz/recs";

export type tablesToComponents<tables extends Record<string, Table>> = {
  [label in keyof tables as tables[label]["label"]]: tableToComponent<tables[label]>;
};

export function tablesToComponents<tables extends Record<string, Table>>(
  world: World,
  tables: tables,
): tablesToComponents<tables> {
  return Object.fromEntries(
    Object.entries(tables).map(([, table]) => [table.label, tableToComponent(world, table)]),
  ) as never;
}
