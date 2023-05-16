import { mudConfig } from "@latticexyz/world/snapSync";
import { resolveTableId } from "@latticexyz/config";

export default mudConfig({
  snapSync: true,
  systems: {
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
      keySchema: {},
      schema: {
        value: "string",
      },
      ephemeral: true,
    },
    Inventory: {
      keySchema: {
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
