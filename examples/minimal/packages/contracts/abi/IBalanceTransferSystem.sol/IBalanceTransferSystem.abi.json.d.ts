declare const abi: [
  {
    inputs: [
      {
        internalType: "bytes16";
        name: "fromNamespace";
        type: "bytes16";
      },
      {
        internalType: "address";
        name: "toAddress";
        type: "address";
      },
      {
        internalType: "uint256";
        name: "amount";
        type: "uint256";
      }
    ];
    name: "transferBalanceToAddress";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes16";
        name: "fromNamespace";
        type: "bytes16";
      },
      {
        internalType: "bytes16";
        name: "toNamespace";
        type: "bytes16";
      },
      {
        internalType: "uint256";
        name: "amount";
        type: "uint256";
      }
    ];
    name: "transferBalanceToNamespace";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  }
];
export default abi;
