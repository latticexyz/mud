import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  enums: {
    Direction: ["North", "East", "South", "West"],
  },
  tables: {
    Movable: "bool",
    Player: "bool",
    Position: {
      schema: {
        id: "bytes32",
        x: "int32",
        y: "int32",
      },
      key: ["id"],
      codegen: {
        dataStruct: false,
      },
    },
  },
});
