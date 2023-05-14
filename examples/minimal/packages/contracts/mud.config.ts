import { mudConfig } from "@latticexyz/world/register";
import { resolveTableId } from "@latticexyz/config";

export default mudConfig({
  namespace: "",
  overrideSystems: {
    IncrementSystem: {
      name: "increment",
      openAccess: true,
    },
  },
  tables: {
    CounterTable: {
      schema: {
        value: "uint32",
      },
      storeArgument: true,
    },
    MessageTable: {
      primaryKeys: {},
      schema: {
        value: "string",
      },
      ephemeral: true,
    },
    TestTable: {
      primaryKeys: {
        first: "uint160",
        second: "address",
        third: "bytes20",
      },
      schema: { value: "uint64" },
    },
  },
  modules: [
    {
      name: "KeysWithValueModule",
      root: true,
      args: [resolveTableId("CounterTable")],
    },
  ],
});
