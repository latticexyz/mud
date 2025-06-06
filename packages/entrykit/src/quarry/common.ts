import { defineStore } from "@latticexyz/store";
import { parseAbi } from "viem";

// TODO: move the whole paymaster in here so we can just re-export ABI + MUD config

export const paymasterAbi = parseAbi([
  "error SpenderSystem_AlreadyRegistered(address spender, address user)",
  "error SpenderSystem_HasOwnBalance(address spender)",
  "error BalanceSystem_BalanceTooHigh(address user, uint256 balance, uint256 max)",
  "error BalanceSystem_InsufficientBalance(address user, uint256 amount, uint256 balance)",
  "function registerSpender(address spender)",
  "function depositTo(address to) payable",
  "function withdrawTo(address to, uint256 amount)",
]);

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
        Balance: {
          schema: {
            user: "address",
            balance: "uint256",
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
