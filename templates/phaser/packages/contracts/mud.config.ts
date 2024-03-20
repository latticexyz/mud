import { defineWorld } from "@latticexyz/world";

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
