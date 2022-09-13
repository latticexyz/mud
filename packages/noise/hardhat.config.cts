import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-chai-matchers";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  paths: {
    tests: "test/hardhat/",
  },
};

export default config;
