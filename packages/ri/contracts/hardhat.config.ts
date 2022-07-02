import { HardhatUserConfig } from "hardhat/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "./tasks/compile";

const degen = {
  live: true,
  url: "https://follower.super-degen-chain.lattice.xyz",
  accounts: ["0x26e86e45f6fc45ec6e2ecd128cec80fa1d1505e5507dcd2ae58c3130a7a97b48"],
  chainId: 4242,
};

// this is when connecting to a localhost hh instance, it doesn't actually configure the hh network. for this setup stuff in the 'hardhat' key.
const localhost = {
  url: "http://localhost:8545/",
  accounts: [
    "0x044C7963E9A89D4F8B64AB23E02E97B2E00DD57FCB60F316AC69B77135003AEF",
    "0x523170AAE57904F24FFE1F61B7E4FF9E9A0CE7557987C2FC034EACB1C267B4AE",
    "0x67195c963ff445314e667112ab22f4a7404bad7f9746564eb409b9bb8c6aed32",
  ],
  chainId: 31337,
};

const hardhat = {
  initialDate: "1993-11-19",
  mining: {
    auto: false,
    interval: 1000,
  },
  gasPrice: 0,
  initialBaseFeePerGas: 0,
  blockGasLimit: 16777215,
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
};

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0, // first skey derived from the hd wallet
    user1: 1,
    user2: 2,
  },
  paths: {
    sources: "./src",
  },
  networks: {
    degen,
    localhost,
    hardhat,
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
  external: {
    contracts: [
      {
        artifacts: "@latticexyz/persona/abi",
      },
    ],
  },
  deterministicDeployment: {
    "4242": {
      factory: "0xC39496f108A05b8111Ae5B283c114CfB0327B359",
      deployer: "0x16820E675fF74dC1DfB0a21f8735c291eEE61F1f",
      funding: "1000000000",
      signedTx:
        "0xf8a78085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf3822147a0339736b46d151775b8649857c91ecc36b2e7f1c6fb78a07c8794abcb1ca5c826a002ddd269b8268ceeec100c69a4b467086a0f9541d29d979285cd0976c10d9963",
    },
  },
};

export default config;
