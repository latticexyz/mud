import { describe, it } from "vitest";
import { resolveStoreConfig } from "./store";
import { attest } from "@arktype/attest";
import { StoreConfig as StoreConfigV1 } from "../storeConfig";
import { mudConfig } from "../../register";
import { configToV1 } from "./compat";
import { Config } from "./output";

describe("configToV1", () => {
  it("should transform the broad v2 output to the broad v1 output", () => {
    attest<StoreConfigV1, configToV1<Config>>();
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

    const configV2 = resolveStoreConfig({
      enums: {
        TerrainType: ["None", "Ocean", "Grassland", "Desert"],
      },
      userTypes: {
        CustomAddress: "address",
      },
      tables: {
        Position: {
          schema: {
            player: "address",
            x: "int32",
            y: "int32",
          },
          primaryKey: ["player"],
        },
        Health: {
          schema: {
            player: "CustomAddress",
            health: "uint256",
          },
          primaryKey: ["player"],
        },
        Terrain: {
          schema: {
            x: "int32",
            y: "int32",
            terrainType: "TerrainType",
          },
          primaryKey: ["x", "y"],
        },
      },
    });

    attest<typeof configV1>(configToV1(configV2)).equals(configV1);
  });
});
