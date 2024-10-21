import { defineWorld } from "@latticexyz/world";
import { encodeAbiParameters, stringToHex } from "viem";

const erc20ModuleArgs = encodeAbiParameters(
  [
    { type: "bytes14" },
    {
      type: "tuple",
      components: [{ type: "uint8" }, { type: "string" }, { type: "string" }],
    },
  ],
  [stringToHex("MyToken", { size: 14 }), [18, "Worthless Token", "WT"]],
);

const erc721ModuleArgs = encodeAbiParameters(
  [
    { type: "bytes14" },
    {
      type: "tuple",
      components: [{ type: "string" }, { type: "string" }, { type: "string" }],
    },
  ],
  [stringToHex("MyNFT", { size: 14 }), ["No Valuable Token", "NVT", "http://www.example.com/base/uri/goes/here"]],
);

export default defineWorld({
  tables: {
    Number: {
      schema: {
        key: "uint32",
        value: "uint32",
      },
      key: ["key"],
    },
    Vector: {
      schema: {
        key: "uint32",
        x: "int32",
        y: "int32",
      },
      key: ["key"],
    },
    NumberList: {
      schema: {
        value: "uint32[]",
      },
      key: [],
    },
    Multi: {
      schema: {
        a: "uint32",
        b: "bool",
        c: "uint256",
        d: "int120",
        num: "int256",
        value: "bool",
      },
      key: ["a", "b", "c", "d"],
    },
    Position: {
      schema: {
        zone: "bytes32",
        x: "int32",
        y: "int32",
        player: "address",
      },
      key: ["zone", "x", "y"],
    },
    StaticArray: {
      schema: {
        num: "uint256",
        value: "uint256[3]",
      },
      key: [],
    },
    DynamicArray: {
      schema: {
        num: "uint256",
        value: "uint256[]",
      },
      key: [],
    },
  },
  systems: {
    HiddenSystem: {
      deploy: {
        registerWorldFunctions: false,
      },
    },
  },
  modules: [
    {
      artifactPath:
        "@latticexyz/world-modules/out/Unstable_CallWithSignatureModule.sol/Unstable_CallWithSignatureModule.json",
      root: true,
    },
    {
      artifactPath: "@latticexyz/world-modules/out/PuppetModule.sol/PuppetModule.json",
      root: false,
      args: [],
    },
    {
      artifactPath: "@latticexyz/world-modules/out/ERC20Module.sol/ERC20Module.json",
      root: false,
      args: [
        {
          type: "bytes",
          value: erc20ModuleArgs,
        },
      ],
    },
    {
      artifactPath: "@latticexyz/world-modules/out/ERC721Module.sol/ERC721Module.json",
      root: false,
      args: [
        {
          type: "bytes",
          value: erc721ModuleArgs,
        },
      ],
    },
  ],
});
