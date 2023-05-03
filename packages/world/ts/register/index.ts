// Importing this file has side-effects for MUD config,
// and the order of imports is important in relation to other plugins
// (store should usually be the first plugin, followed by world)

// For convenience register and reexport store (which does the same for core config),
// to reduce the number of needed imports for users
export * from "@latticexyz/store/register";
// Extend core config and types
import "./configExtensions";
import "./typeExtensions";

// TODO this should not be needed?
// (typescript errors without this, despite `export *` earlier)
export { mudConfig } from "@latticexyz/store/register";
