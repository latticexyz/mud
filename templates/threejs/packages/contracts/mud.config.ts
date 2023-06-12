import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    Position: {
      schema: {
        x: "int32",
        y: "int32",
        z: "int32",
      },
    },
  },
});
