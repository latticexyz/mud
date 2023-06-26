import { resolveTableId } from "@latticexyz/config";
import { mudConfig, storePlugin } from "@latticexyz/store";
import { worldPlugin } from "@latticexyz/world";
/**
 * This plugin adds a flag to enable "snap sync mode".
 * It allows clients to sync the latest state of the world using view functions.
 * This is a simple way to quickly sync without the use of an external indexer.
 * This could lead to expensive queries on live RPCs if the world is large,
 * so we suggest using MODE for production deployments.
 */
import { snapSyncPlugin } from "@latticexyz/world/snapsync";

export default mudConfig({
  plugins: { storePlugin, worldPlugin, snapSyncPlugin },
  snapSync: true,
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
        owner: "address",
        item: "uint32",
        itemVariant: "uint32",
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
