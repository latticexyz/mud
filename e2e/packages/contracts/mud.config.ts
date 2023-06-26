import { mudConfig, storePlugin } from "@latticexyz/store";
import { worldPlugin } from "@latticexyz/world";

export default mudConfig({
  plugins: { storePlugin, worldPlugin },
  tables: {
    NumberList: {
      keySchema: {},
      schema: {
        value: "uint32[]",
      },
    },
  },
} as const);
