import { mudConfig } from "@latticexyz/world/register";

import { resolveTableId } from "@latticexyz/config";

export default mudConfig({
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
      keySchema: {},
      valueSchema: {
        value: "uint32",
      },
      storeArgument: true,
    },
    MessageTable: {
      keySchema: {},
      valueSchema: {
        value: "string",
      },
      offchainOnly: true,
    },
    Inventory: {
      keySchema: {
        owner: "address",
        item: "uint32",
        itemVariant: "uint32",
      },
      valueSchema: { amount: "uint32" },
    },
  },
  // KeysWithValue doesn't seem to like singleton keys
  // modules: [
  //   {
  //     name: "KeysWithValueModule",
  //     root: true,
  //     args: [resolveTableId("CounterTable")],
  //   },
  // ],
});
