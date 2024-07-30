import { Tables } from "@latticexyz/config";
import { tableToComponent } from "./tableToComponent";
import { World } from "@latticexyz/recs";
import { show } from "@ark/util";

export type tablesToComponents<tables extends Tables> = {
  [label in keyof tables as tables[label]["label"]]: tableToComponent<tables[label]>;
};

export function tablesToComponents<tables extends Tables>(
  world: World,
  tables: tables,
): show<tablesToComponents<tables>> {
  return Object.fromEntries(
    Object.entries(tables).map(([, table]) => [table.label, tableToComponent(world, table)]),
  ) as never;
}
