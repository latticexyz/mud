// Follows https://viem.sh/docs/actions/wallet/signTypedData#usage

export const callWithSignatureTypes = {
  Call: [
    { name: "signer", type: "address" },
    { name: "systemNamespace", type: "string" },
    { name: "systemName", type: "string" },
    { name: "callData", type: "bytes" },
    { name: "nonce", type: "uint256" },
  ],
} as const;
