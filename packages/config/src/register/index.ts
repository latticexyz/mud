import { mudCoreConfig, resolveTableId } from "../library";
import { MUDCoreContext } from "../library/context";

export { mudCoreConfig, resolveTableId };

// Importing this file has side-effects, and it should always be imported before MUD plugins.
// Use this import for defining a MUD config.
// Use the library endpoint instead when writing MUD-based libraries or plugins.
if (!MUDCoreContext.isCreated()) {
  MUDCoreContext.createContext();
}
