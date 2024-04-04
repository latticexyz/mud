import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  enums: {
    TerrainType: ["None", "Ocean", "Grassland", "Desert"],
  },
  tables: {
    Position: {
      schema: {
        player: "address",
        x: "int32",
        y: "int32",
      },
      key: ["player"],
    },
    Health: {
      schema: {
        player: "address",
        health: "uint256",
      },
      key: ["player"],
    },
    Inventory: {
      schema: {
        player: "address",
        item: "uint8",
        amount: "uint32",
      },
      key: ["player", "item"],
    },
    Score: {
      schema: {
        player: "address",
        game: "uint256",
        score: "uint256",
      },
      key: ["player", "game"],
    },
    Winner: {
      schema: {
        game: "uint256",
        player: "address",
      },
      key: ["game"],
    },
    Terrain: {
      schema: {
        x: "int32",
        y: "int32",
        terrainType: "TerrainType",
      },
      key: ["x", "y"],
    },
  },
});
