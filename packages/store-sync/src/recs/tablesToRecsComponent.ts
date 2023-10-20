import { World } from "@latticexyz/recs";
import { Table } from "../common";
import { TablesToRecsComponents } from "./common";
import { tableToRecsComponent } from "./tableToRecsComponent";

export function tablesToRecsComponents<tables extends Record<string, Omit<Table, "address">>>(
  world: World,
  tables: tables
): TablesToRecsComponents<tables> {
  return Object.fromEntries(
    Object.entries(tables).map(([tableName, table]) => [tableName, tableToRecsComponent(world, table)])
  ) as TablesToRecsComponents<tables>;
}
