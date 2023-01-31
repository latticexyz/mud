import { HardhatUserConfig } from "hardhat/config";
import "./tasks/compile";
import "solidity-docgen";

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
  docgen: {
    outputDir: "API",
  },
};

export default config;
