import { mudConfig, resolveTableId } from "@latticexyz/world/register";

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
    MessageTable: {
      primaryKeys: {},
      schema: {
        value: "string",
      },
      ephemeral: true,
    },
  },
  modules: [
    {
      name: "KeysInTableModule",
      root: true,
      args: [resolveTableId("CounterTable")],
    },
    {
      name: "KeysWithValueModule",
      root: true,
      args: [resolveTableId("CounterTable")],
    },
    {
      name: "SnapSyncModule",
      root: true,
      args: [],
    },
  ],
});
