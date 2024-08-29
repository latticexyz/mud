import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "erc20-store",
  tables: {
    Token: {
      schema: {
        decimals: "uint8",
        totalSupply: "uint256",
        owner: "address",
        name: "string",
        symbol: "string",
      },
      key: [], // Singleton table
      codegen: {
        outputDirectory: "./tables",
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
