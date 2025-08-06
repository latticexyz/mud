import { parseAbi } from "viem";

// TODO: import base world ABI + paymaster ABI

export const worldAbi = parseAbi([
  "function registerDelegation(address delegatee, bytes32 delegationControlId, bytes initCallData)",
  "function registerSpender(address spender)",
]);
