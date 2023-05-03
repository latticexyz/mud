// Importing this file has side-effects for MUD config,
// and the order of imports is important in relation to other plugins
// (store should usually be the first plugin)

// For convenience register and reexport config, to reduce the number of needed imports for users
export { mudCoreConfig, resolveTableId } from "@latticexyz/config/register";
// Extend core config and types
import "./configExtensions";
import "./typeExtensions";

// Export store-specific config wrapper, which adds generics for better typehints
export { mudConfig } from "../library/config";
