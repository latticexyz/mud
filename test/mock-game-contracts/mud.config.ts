import { mudConfig } from "@latticexyz/world/register";
import { defineWorld } from "@latticexyz/world/config/v2";

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

export const configV2 = defineWorld({
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
