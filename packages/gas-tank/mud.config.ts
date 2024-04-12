import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  tables: {
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
  modules: [{ name: "Unstable_CallWithSignatureModule", root: true }],
});
