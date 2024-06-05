import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespaces: {
    game: {
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
    gameFork: {
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
    somePlugin: {
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
