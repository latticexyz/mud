import { Tables } from "@latticexyz/config";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";
import { configToTables } from "./configToTables";
import { merge, show } from "@arktype/util";

type mudTables = merge<configToTables<typeof storeConfig>, configToTables<typeof worldConfig>>;
const mudTables = {
  ...configToTables(storeConfig),
  ...configToTables(worldConfig),
};

// TODO: validate that extraTables keys correspond to table labels?
export type getAllTables<tables extends Tables> = merge<tables, mudTables>;

export function getAllTables<tables extends Tables>(tables: tables): show<getAllTables<tables>> {
  return {
    ...tables,
    ...mudTables,
  } as never;
}
