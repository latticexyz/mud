import { mudConfig, resolveTableId } from "@latticexyz/world/register";

export default mudConfig({
  overrideSystems: {
    IncrementSystem: {
      name: "increment",
      openAccess: true,
    },
    SyncSystem: {
      name: "sync",
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
    PositionTable: {
      schema: {
        x: "int32",
        y: "int32",
      },
    }
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
      name: "KeysInTableModule",
      root: true,
      args: [resolveTableId("PositionTable")],
    },
  ],
});
