import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespaces: {
    game: {
      tables: {
        Position: {
          schema: {
            player: "address",
            x: "int32",
            y: "int32",
          },
          key: ["player"],
        },
        Score: {
          schema: {
            player: "address",
            score: "uint256",
          },
          key: ["player"],
        },
      },
    },
    somePlugin: {
      tables: {
        Victory: {
          schema: {
            value: "bool",
          },
          key: [],
        },
      },
    },
    gameFork: {
      tables: {
        Position: {
          schema: {
            player: "address",
            x: "int32",
            y: "int32",
          },
          key: ["player"],
        },
        Score: {
          schema: {
            player: "address",
            score: "uint256",
          },
          key: ["player"],
        },
      },
    },
  },
});
