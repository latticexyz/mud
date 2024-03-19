import { defineWorld } from "@latticexyz/world/config/v2";

export default defineWorld({
  tables: {
    Position: {
      schema: {
        key: "bytes32",
        x: "int32",
        y: "int32",
        z: "int32",
      },
      key: ["key"],
    },
  },
});
