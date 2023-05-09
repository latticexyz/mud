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
    TemplateContent: {
      primaryKeys: { templateId: "bytes32", tableId: "bytes32" },
      schema: "bytes",
    },
    TemplateIndex: {
      schema: "bytes32[]",
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
