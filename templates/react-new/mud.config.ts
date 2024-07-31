import { defineWorld } from "@latticexyz/world";

const config = defineWorld({
  tables: {
    MatchSky: {
      key: ["matchEntity"],
      schema: {
        matchEntity: "bytes32",
        createdAt: "uint256",
        reward: "uint256",
      },
    },
  },
});

export default config;
