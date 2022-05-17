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
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://localhost:8545/",
      accounts: [
        "0x044C7963E9A89D4F8B64AB23E02E97B2E00DD57FCB60F316AC69B77135003AEF",
        "0x523170AAE57904F24FFE1F61B7E4FF9E9A0CE7557987C2FC034EACB1C267B4AE",
        "0x67195c963ff445314e667112ab22f4a7404bad7f9746564eb409b9bb8c6aed32",
      ],
      chainId: 31337,
    },
    hardhat: {
      mining: {
        auto: true,
      },
      gasPrice: 0,
      initialBaseFeePerGas: 0,
      blockGasLimit: 999999999999999,
      accounts: [
        // from/deployer is default the first address in accounts
        {
          privateKey: "0x044C7963E9A89D4F8B64AB23E02E97B2E00DD57FCB60F316AC69B77135003AEF",
          balance: "100000000000000000000",
        },
        // user1 in tests
        {
          privateKey: "0x523170AAE57904F24FFE1F61B7E4FF9E9A0CE7557987C2FC034EACB1C267B4AE",
          balance: "100000000000000000000",
        },
        // user2 in tests
        {
          privateKey: "0x67195c963ff445314e667112ab22f4a7404bad7f9746564eb409b9bb8c6aed32",
          balance: "100000000000000000000",
        },
      ],
    },
  },
};

export default config;
