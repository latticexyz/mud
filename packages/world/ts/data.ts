// Inspired by https://viem.sh/docs/actions/wallet/signTypedData#usage

export const types = {
  Delegation: [
    { name: "delegatee", type: "address" },
    { name: "delegationControlId", type: "bytes32" },
    { name: "initCallData", type: "bytes" },
    { name: "nonce", type: "uint256" },
  ],
} as const;
