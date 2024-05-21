import { defineWorld } from "@latticexyz/world";
import { resolveTableId } from "@latticexyz/world/internal";

export default defineWorld({
  namespace: "app",
  tables: {
    Tasks: {
      schema: {
        id: "bytes32",
        createdAt: "uint256",
        completedAt: "uint256",
        description: "string",
      },
      key: ["id"],
    },
  },
  modules: [
    {
      artifactPath: "@latticexyz/world-modules/out/KeysWithValueModule.sol/KeysWithValueModule.json",
      root: true,
      args: [resolveTableId("Tasks")],
    },
  ],
});
