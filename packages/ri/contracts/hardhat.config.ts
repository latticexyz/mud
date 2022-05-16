import { HardhatUserConfig } from "hardhat/config";
import "hardhat-abi-exporter";
import "hardhat-diamond-abi";
import "@typechain/hardhat";

import "./tasks/compile";

const config: HardhatUserConfig = {
  paths: {
    sources: "./src",
  },
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  typechain: {
    outDir: "./types/ethers-contracts",
    target: "ethers-v5",
  },
  diamondAbi: {
    name: "Ember",
    include: ["Facet"],
    strict: true,
  },
  abiExporter: {
    path: "./abi",
    runOnCompile: true,
    flat: true,
    only: [":Ember$", ":World", "Component"],
  },
};

export default config;
