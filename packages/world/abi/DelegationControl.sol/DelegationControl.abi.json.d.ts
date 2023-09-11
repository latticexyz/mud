declare const abi: [
  {
    inputs: [
      {
        internalType: "address";
        name: "delegator";
        type: "address";
      },
      {
        internalType: "bytes32";
        name: "systemId";
        type: "bytes32";
      },
      {
        internalType: "bytes";
        name: "funcSelectorAndArgs";
        type: "bytes";
      }
    ];
    name: "verify";
    outputs: [
      {
        internalType: "bool";
        name: "";
        type: "bool";
      }
    ];
    stateMutability: "nonpayable";
    type: "function";
  }
];
export default abi;
