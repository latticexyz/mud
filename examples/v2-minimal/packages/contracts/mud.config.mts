import { resolveTableId } from "@latticexyz/config";
import { mudConfig, storePlugin } from "@latticexyz/store";
import { worldPlugin } from "@latticexyz/world";

export default mudConfig({
  overrideSystems: {
    IncrementSystem: {
      name: "increment",
      openAccess: true,
    },
  },
  tables: {
    CounterTable: {
      name: "counter",
      schema: {
        value: "uint32",
      },
      storeArgument: true,
    },
  },
  modules: [
    {
      name: "KeysWithValueModule",
      root: true,
      args: [resolveTableId("CounterTable")],
    },
  ],
  plugins: [storePlugin, worldPlugin],
});
