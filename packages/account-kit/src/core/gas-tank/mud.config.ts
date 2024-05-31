import { defineStore } from "@latticexyz/store";

// Copied from gas-tank repo until we can use it as a dependency:
// https://github.com/latticexyz/gas-tank/blob/main/packages/contracts/mud.config.ts
export default defineStore({
  tables: {
    EntryPoint: {
      schema: {
        addr: "address",
      },
      key: [],
    },
    UserBalances: {
      schema: {
        userAccount: "address",
        balance: "uint256",
      },
      key: ["userAccount"],
    },
    Spender: {
      schema: {
        spender: "address",
        userAccount: "address",
      },
      key: ["spender"],
    },
  },
});
