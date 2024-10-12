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
    },
    Balances: {
      schema: {
        account: "address",
        balance: "uint256",
      },
      key: ["account"],
    },
    Allowances: {
      schema: {
        account: "address",
        spender: "address",
        approval: "uint256",
      },
      key: ["account", "spender"],
    },
  },
});
