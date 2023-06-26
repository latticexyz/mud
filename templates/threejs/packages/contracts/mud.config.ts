import { mudConfig, storePlugin } from "@latticexyz/store";
import { worldPlugin } from "@latticexyz/world";

export default mudConfig({
  plugins: { storePlugin, worldPlugin },
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
