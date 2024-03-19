import { describe, it } from "vitest";
import { defineStore } from "./store";
import { attest } from "@arktype/attest";
import { StoreConfig as StoreConfigV1 } from "../storeConfig";
import { mudConfig } from "../../register";
import { storeToV1 } from "./compat";
import { Store } from "./output";

describe("configToV1", () => {
  it("should transform the broad v2 output to the broad v1 output", () => {
    attest<StoreConfigV1, storeToV1<Store>>();
    attest<storeToV1<Store>, StoreConfigV1>();
  });

  it("should transform a v2 store config output to the v1 config output", () => {
    const configV1 = mudConfig({
      enums: {
        TerrainType: ["None", "Ocean", "Grassland", "Desert"],
      },
      userTypes: {
        CustomAddress: {
          filePath: "path/to/file",
          internalType: "address",
        },
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
            player: "CustomAddress",
          },
          valueSchema: {
            health: "uint256",
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
    }) satisfies StoreConfigV1;

    const configV2 = defineStore({
      enums: {
        TerrainType: ["None", "Ocean", "Grassland", "Desert"],
      },
      userTypes: {
        CustomAddress: { type: "address", filePath: "path/to/file" },
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
            player: "CustomAddress",
            health: "uint256",
          },
          key: ["player"],
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

    attest<typeof configV1>(storeToV1(configV2)).equals(configV1);
    attest<storeToV1<typeof configV2>>(configV1);
  });
});
