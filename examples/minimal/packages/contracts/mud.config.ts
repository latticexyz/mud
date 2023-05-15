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
    Inventory: {
      primaryKeys: {
        user: "address",
        item: "bytes32",
        variant: "uint32",
      },
      schema: { amount: "uint32" },
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
