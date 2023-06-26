import { mudConfig, storePlugin } from "@latticexyz/store";
import { worldPlugin } from "@latticexyz/world";

export default mudConfig({
  plugins: { storePlugin, worldPlugin },
  tables: {
    Counter: {
      keySchema: {},
      schema: "uint32",
    },
  },
});
