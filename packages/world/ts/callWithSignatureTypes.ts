// Follows https://viem.sh/docs/actions/wallet/signTypedData#usage

export const callWithSignatureTypes = {
  Call: [
    { name: "delegator", type: "address" },
    { name: "systemId", type: "bytes32" },
    { name: "callData", type: "bytes" },
    { name: "nonce", type: "uint256" },
  ],
} as const;
