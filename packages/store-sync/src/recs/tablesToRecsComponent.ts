import { World } from "@latticexyz/recs";
import { TablesInput, TablesToRecsComponents } from "./common";
import { tableToRecsComponent } from "./tableToRecsComponent";

export function tablesToRecsComponents<tables extends TablesInput>(
  world: World,
  tables: tables
): TablesToRecsComponents<tables> {
  return Object.fromEntries(
    Object.entries(tables).map(([tableName, table]) => [tableName, tableToRecsComponent(world, table)])
  ) as TablesToRecsComponents<tables>;
}
