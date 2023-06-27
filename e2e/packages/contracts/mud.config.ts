import { mudConfig, storePlugin } from "@latticexyz/store";
import { worldPlugin } from "@latticexyz/world";

export default mudConfig({
  plugins: { storePlugin, worldPlugin },
  tables: {
    Number: {
      keySchema: {
        key: "uint32",
      },
      schema: {
        value: "uint32",
      },
    },
    Vector: {
      keySchema: {
        key: "uint32",
      },
      schema: {
        x: "int32",
        y: "int32",
      },
    },
    NumberList: {
      keySchema: {},
      schema: {
        value: "uint32[]",
      },
    },
  },
} as const);
