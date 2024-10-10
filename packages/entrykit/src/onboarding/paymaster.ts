import { defineStore } from "@latticexyz/store";

export const paymasterConfig = defineStore({
  namespaces: {
    root: {
      namespace: "",
      tables: {
        Allowance: {
          schema: {
            user: "address",
            allowance: "uint256",
          },
          key: ["user"],
        },
        Grantor: {
          schema: {
            grantor: "address",
            allowance: "uint256",
          },
          key: ["grantor"],
        },
        PassHolder: {
          schema: {
            user: "address",
            passId: "bytes32",
            lastRenewed: "uint256",
            lastClaimed: "uint256",
          },
          key: ["user", "passId"],
        },
        PassConfig: {
          schema: {
            passId: "bytes32",
            claimAmount: "uint256",
            claimInterval: "uint256",
            validityPeriod: "uint256",
            grantor: "address",
          },
          key: ["passId"],
        },
        Spender: {
          schema: {
            spender: "address",
            user: "address",
          },
          key: ["spender"],
        },
        SystemConfig: {
          schema: {
            entryPoint: "address",
          },
          key: [],
        },
      },
    },
  },
});

export const paymasterTables = paymasterConfig.namespaces.root.tables;
