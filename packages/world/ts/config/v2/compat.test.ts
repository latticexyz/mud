import { describe, it } from "vitest";
import { attest } from "@arktype/attest";
import { WorldConfig as WorldConfigV1 } from "../types";
import { StoreConfig as StoreConfigV1 } from "@latticexyz/store/config";
import { World } from "./output";
import { worldToV1 } from "./compat";
import { mudConfig } from "../../register";
import { defineWorld } from "./world";

describe("configToV1", () => {
  it("should transform the broad v2 output to the broad v1 output", () => {
    // Making the `worldContractName` prop required here since it is required on the output of `mudConfig`
    attest<WorldConfigV1 & StoreConfigV1, worldToV1<World>>();
    attest<worldToV1<World>, WorldConfigV1 & StoreConfigV1>();
  });

  it("should transform a v2 store config output to the v1 config output", () => {
    const configV1 = mudConfig({
      worldContractName: undefined,
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
    }) satisfies StoreConfigV1 & WorldConfigV1;

    const configV2 = defineWorld({
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

    attest<typeof configV1>(worldToV1(configV2)).equals(configV1);
    attest<worldToV1<typeof configV2>>(configV1);
  });
});
