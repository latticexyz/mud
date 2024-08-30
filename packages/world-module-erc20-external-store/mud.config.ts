import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "erc20-store",
  tables: {
    Token: {
      schema: {
        decimals: "uint8",
        totalSupply: "uint256",
        owner: "address",
        id: "bytes32",
        name: "string",
        symbol: "string",
      },
      key: ["id"],
      codegen: {
        tableIdArgument: true,
        storeArgument: true,
      },
    },
    Balances: {
      schema: {
        tokenAddress: "address",
        account: "address",
        balance: "uint256",
      },
      key: ["tokenAddress", "account"],
    },
    Allowances: {
      schema: {
        tokenAddress: "address",
        account: "address",
        spender: "address",
        approval: "uint256",
      },
      key: ["tokenAddress", "account", "spender"],
    },
  },
});
