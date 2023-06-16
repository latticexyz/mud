// Importing this file has side-effects for MUD config,
// and the order of imports is important in relation to other plugins
// (store should usually be the first plugin, followed by world)

// For convenience register and reexport store (which does the same for core config),
// to reduce the number of needed imports for users
import "@latticexyz/store/register";
export { mudConfig, mudCoreConfig, resolveTableId } from "@latticexyz/store/register";
// Extend core config and types
import "./configExtensions";
import "./typeExtensions";
