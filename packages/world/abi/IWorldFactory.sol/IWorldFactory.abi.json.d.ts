declare const abi: [
  {
    anonymous: false;
    inputs: [
      {
        indexed: true;
        internalType: "address";
        name: "newContract";
        type: "address";
      }
    ];
    name: "WorldDeployed";
    type: "event";
  },
  {
    inputs: [];
    name: "deployWorld";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [];
    name: "worldCount";
    outputs: [
      {
        internalType: "uint256";
        name: "";
        type: "uint256";
      }
    ];
    stateMutability: "view";
    type: "function";
  }
];
export default abi;
