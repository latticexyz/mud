import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "game",
  codegen: { namespaceDirectories: true },
  tables: {
    Health: {
      schema: {
        player: "address",
        value: "uint32",
      },
      key: ["player"],
    },
    Position: {
      schema: {
        player: "address",
        x: "int32",
        y: "int32",
      },
      key: ["player"],
    },
  },
});
