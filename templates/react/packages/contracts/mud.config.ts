import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    Tasks: {
      offchainOnly: true,
      valueSchema: {
        createdAt: "uint256",
        completedAt: "uint256",
        description: "string",
      },
    },
  },
});
