import { defineWorld } from "@latticexyz/world/config/v2";

export default defineWorld({
  tables: {
    Tasks: {
      schema: {
        key: "bytes32",
        createdAt: "uint256",
        completedAt: "uint256",
        description: "string",
      },
      key: ["key"],
    },
  },
});
