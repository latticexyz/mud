import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespaces: {
    a: {
      tables: {
        Value: {
          schema: {
            value: "uint256",
          },
          key: [],
        },
      },
    },

    b: {},
  },
});
