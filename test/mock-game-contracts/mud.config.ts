import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  enums: {
    TerrainType: ["None", "Ocean", "Grassland", "Desert"],
  },
  tables: {
    Position: {
      keySchema: {
        player: "address",
      },
      valueSchema: {
        x: "int32",
        y: "int32",
      },
    },
    Health: {
      keySchema: {
        player: "address",
      },
      valueSchema: {
        health: "uint256",
      },
    },
    Inventory: {
      keySchema: {
        player: "address",
        item: "uint8",
      },
      valueSchema: {
        amount: "uint32",
      },
    },
    Score: {
      keySchema: {
        player: "address",
        game: "uint256",
      },
      valueSchema: {
        score: "uint256",
      },
    },
    Winner: {
      keySchema: {
        game: "uint256",
      },
      valueSchema: {
        player: "address",
      },
    },
    Terrain: {
      keySchema: {
        x: "int32",
        y: "int32",
      },
      valueSchema: {
        terrainType: "TerrainType",
      },
    },
  },
});
