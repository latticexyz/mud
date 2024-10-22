import { defineWorld } from "@latticexyz/world";
import { encodeAbiParameters, stringToHex } from "viem";
import { defineERC20Config } from "@latticexyz/world-module-erc20";

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
  modules: [
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
    defineERC20Config({
      namespace: "erc20Namespace",
      name: "MyToken",
      symbol: "MTK",
    }),
  ],
});
