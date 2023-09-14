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
        name: "interfaceID";
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
    stateMutability: "view";
    type: "function";
  }
];
export default abi;
