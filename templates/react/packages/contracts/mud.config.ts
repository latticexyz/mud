import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    Tasks: {
      valueSchema: {
        createdAt: "uint256",
        completedAt: "uint256",
        description: "string",
      },
    },
  },
});
