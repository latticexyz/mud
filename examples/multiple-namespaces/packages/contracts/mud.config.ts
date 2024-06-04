import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "game",
  tables: {
    Health: {
      schema: {
        player: "address",
        value: "uint256",
      },
      key: ["player"],
    },
  },
});
