// Follows https://viem.sh/docs/actions/wallet/signTypedData#usage

export const delegationWithSignatureTypes = {
  Delegation: [
    { name: "delegatee", type: "address" },
    { name: "delegationControlId", type: "bytes32" },
    { name: "initCallData", type: "bytes" },
    { name: "nonce", type: "uint256" },
  ],
} as const;
