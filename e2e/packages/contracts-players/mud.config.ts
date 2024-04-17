import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  tables: {
    Players: {
      schema: {
        player: "address",
        isTeamRight: "bool",
        title: "string",
        items: "uint32[69]",
        resources: "uint256[5]",
        units: "uint32[14]",
      },
      key: ["player"],
    },
  },
});
