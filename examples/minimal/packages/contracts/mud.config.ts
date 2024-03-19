import { defineWorld } from "@latticexyz/world/config/v2";
import { resolveTableId } from "@latticexyz/config/library";

export default defineWorld({
  systems: {
    IncrementSystem: {
      name: "increment",
      openAccess: true,
    },
  },
  excludeSystems: [
    // Until namespace overrides, this system must be manually deployed in PostDeploy
    "ChatNamespacedSystem",
  ],
  tables: {
    CounterTable: {
      schema: {
        value: "uint32",
      },
      key: [],
      codegen: { storeArgument: true },
    },
    MessageTable: {
      schema: {
        value: "string",
      },
      key: [],
      type: "offchainTable",
    },
    Inventory: {
      schema: {
        owner: "address",
        item: "uint32",
        itemVariant: "uint32",
        amount: "uint32",
      },
      key: ["owner", "item", "itemVariant"],
    },
  },
  modules: [
    {
      name: "KeysWithValueModule",
      root: true,
      args: [resolveTableId("Inventory")],
    },
  ],
});
