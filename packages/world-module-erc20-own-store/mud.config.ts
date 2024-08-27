import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "erc20-own-store",
  tables: {
    MUDERC20: {
      schema: {
        decimals: "uint8",
        totalSupply: "uint256",
        id: "bytes32",
        name: "string",
        symbol: "string",
      },
      key: ["id"],
      codegen: {
        outputDirectory: "./tables",
        tableIdArgument: true,
      },
    },
    Balances: {
      schema: {
        account: "address",
        balance: "uint256",
      },
      key: ["account"],
      codegen: {
        outputDirectory: "./tables",
      },
    },
    Allowances: {
      schema: {
        account: "address",
        spender: "address",
        approval: "uint256",
      },
      key: ["account", "spender"],
      codegen: {
        outputDirectory: "./tables",
      },
    },
  },
});