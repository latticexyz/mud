import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "erc20",
  tables: {
    MUDERC20: {
      schema: {
        totalSupply: "uint256",
        id: "bytes32",
        _name: "string",
        _symbol: "string",
      },
      key: ["id"],
    },
    BALANCES: {
      schema: {
        account: "address",
        balance: "uint256",
      },
      key: ["account"],
    },
    APPROVALS: {
      schema: {
        account: "address",
        approval: "uint256",
      },
      key: ["account"],
    },
  },
});