import { parseAbi } from "viem";

export const worldAbi = parseAbi([
  "function registerDelegation(address delegatee, bytes32 delegationControlId, bytes initCallData)",
]);
