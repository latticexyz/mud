import { mudConfig, resolveTableId } from "@latticexyz/config";

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
      name: "health",
      schema: {
        value: "uint32",
      },
    },
    NameTable: {
      name: "name",
      schema: {
        value: "string",
      },
    },
  },
  modules: [
    {
      name: "KeysInTableModule",
      root: true,
      args: [resolveTableId("CounterTable")],
    },
    {
      name: "KeysInTableModule",
      root: true,
      args: [resolveTableId("NameTable")],
    },
  ],
});
