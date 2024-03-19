import { defineWorld } from "@latticexyz/world/config/v2";

export default defineWorld({
  tables: {
    Counter: {
      schema: {
        value: "uint32",
      },
      key: [],
    },
  },
});
