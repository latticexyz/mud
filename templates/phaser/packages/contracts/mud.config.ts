import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "counter",
  tables: {
    Counter: {
      schema: {
        value: "uint32",
      },
      key: [],
    },
  },
});
