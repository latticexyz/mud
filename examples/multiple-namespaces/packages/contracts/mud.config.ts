import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "game",
  tables: {
    Health: {
      schema: {
        player: "address",
        value: "uint32",
      },
      key: ["player"],
    },
    Position: {
      schema: {
        player: "address",
        x: "int32",
        y: "int32",
      },
      key: ["player"],
    },
  },
  namespaces: {
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
    "game-fork": {
      tables: {
        Health: {
          schema: {
            player: "address",
            value: "uint32",
          },
          key: ["player"],
        },
        Position: {
          schema: {
            player: "address",
            x: "int32",
            y: "int32",
          },
          key: ["player"],
        },
      },
    },
  },
});
