import { defineStore } from "@latticexyz/store";
import { parseAbi } from "viem";

// TODO: import this from quarry-paymaster

export const paymasterAbi = parseAbi([
  // AllowanceSystem
  "error AllowanceSystem_InsufficientAllowance(uint256 allowance, uint256 required)",
  "error AllowanceSystem_NotAuthorized(address caller, address sponsor, address user)",
  "error AllowanceSystem_NotFound(address user, address sponsor)",
  "function removeAllowance(address user, address sponsor)",
  "function getAllowance(address user) view returns (uint256)",
  // GrantSystem
  "error GrantSystem_AllowanceBelowMinimum(uint256 allowance, uint256 min)",
  "error GrantSystem_AllowancesLimitReached(uint256 length, uint256 max)",
  "error GrantSystem_InsufficientBalance(uint256 balance, uint256 required)",
  "function grantAllowance(address user, uint256 allowance) payable",
  // BalanceSystem
  "error BalanceSystem_InsufficientBalance(address user, uint256 amount, uint256 balance)",
  "function depositTo(address to)",
  "function withdrawTo(address to, uint256 amount)",
  // SpenderSystem
  "error SpenderSystem_AlreadyRegistered(address spender, address user)",
  "error SpenderSystem_HasOwnBalance(address spender)",
  "function registerSpender(address spender)",
  // PaymasterSystem
  "error PaymasterSystem_InsufficientFunds(address user, uint256 maxCost, uint256 availableAllowance, uint256 availableBalance)",
  "error PaymasterSystem_OnlyEntryPoint()",
]);

export const paymasterConfig = defineStore({
  namespaces: {
    root: {
      namespace: "",
      tables: {
        // Balance gets deposited and is withdrawable
        Balance: {
          schema: {
            user: "address",
            balance: "uint256",
          },
          key: ["user"],
        },
        // Allowance gets granted and is not withdrawable
        // Allowance is organized as a linked list and gets spent from smallest to largest
        Allowance: {
          name: "AllowanceV2",
          schema: {
            user: "address",
            sponsor: "address",
            allowance: "uint256",
            next: "address",
            previous: "address",
          },
          key: ["user", "sponsor"],
        },
        AllowanceList: {
          schema: {
            user: "address",
            first: "address",
            length: "uint256",
          },
          key: ["user"],
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
