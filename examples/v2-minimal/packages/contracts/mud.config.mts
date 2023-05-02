import { mudConfig, resolveTableId } from "@latticexyz/config";

export default mudConfig({
  overrideSystems: {
    SyncSystem: {
      name: "sync",
      openAccess: true,
    },
  },
  tables: {
    HealthTable: {
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
      args: [resolveTableId("HealthTable")],
    },
    {
      name: "KeysInTableModule",
      root: true,
      args: [resolveTableId("NameTable")],
    },
  ],
});
