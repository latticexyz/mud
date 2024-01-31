import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    Position: {
      valueSchema: {
        x: "int32",
        y: "int32",
        z: "int32",
      },
    },
  },
});
