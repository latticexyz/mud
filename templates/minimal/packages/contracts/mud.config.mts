import { mudConfig } from "@latticexyz/world/register";

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
    },
  },
});
