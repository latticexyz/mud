// Importing this file has side-effects for MUD config,
// and the order of imports is important in relation to other plugins
// (store should usually be the first plugin)

// For convenience register and reexport config, to reduce the number of needed imports for users
import "@latticexyz/config/register";
export { mudCoreConfig, resolveTableId } from "@latticexyz/config/register";
// Extend core config and types
import "./configExtensions";
import "./typeExtensions";

export { mudConfig } from "./mudConfig";
export type { ExpandMUDUserConfig } from "./typeExtensions";
