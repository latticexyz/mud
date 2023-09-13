declare const abi: [
  {
    inputs: [];
    name: "NonRootInstallNotSupported";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "string";
        name: "resourceSelector";
        type: "string";
      }
    ];
    name: "RequiredModuleNotFound";
    type: "error";
  },
  {
    inputs: [];
    name: "RootInstallModeNotSupported";
    type: "error";
  },
  {
    inputs: [];
    name: "_msgSender";
    outputs: [
      {
        internalType: "address";
        name: "sender";
        type: "address";
      }
    ];
    stateMutability: "view";
    type: "function";
  },
  {
    inputs: [];
    name: "_msgValue";
    outputs: [
      {
        internalType: "uint256";
        name: "value";
        type: "uint256";
      }
    ];
    stateMutability: "pure";
    type: "function";
  },
  {
    inputs: [];
    name: "_world";
    outputs: [
      {
        internalType: "address";
        name: "";
        type: "address";
      }
    ];
    stateMutability: "view";
    type: "function";
  },
  {
    inputs: [];
    name: "getName";
    outputs: [
      {
        internalType: "bytes16";
        name: "name";
        type: "bytes16";
      }
    ];
    stateMutability: "view";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes";
        name: "args";
        type: "bytes";
      }
    ];
    name: "install";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes";
        name: "args";
        type: "bytes";
      }
    ];
    name: "installRoot";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes4";
        name: "interfaceId";
        type: "bytes4";
      }
    ];
    name: "supportsInterface";
    outputs: [
      {
        internalType: "bool";
        name: "";
        type: "bool";
      }
    ];
    stateMutability: "pure";
    type: "function";
  }
];
export default abi;
