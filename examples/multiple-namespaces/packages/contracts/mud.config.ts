import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "game",
  tables: {
    Health: {
      schema: {
        player: "address",
        value: "int32",
      },
      key: ["player"],
    },
  },
  namespaces: {
    "game-fork": {
      tables: {
        Health: {
          schema: {
            player: "address",
            value: "int32",
          },
          key: ["player"],
        },
      },
    },
    "some-plugin": {
      tables: {
        Score: {
          schema: {
            player: "address",
            value: "uint256",
          },
          key: ["player"],
        },
      },
    },
  },
});
