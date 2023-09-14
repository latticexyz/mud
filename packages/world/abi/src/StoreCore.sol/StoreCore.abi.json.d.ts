declare const abi: [
  {
    anonymous: false;
    inputs: [
      {
        indexed: false;
        internalType: "bytes32";
        name: "tableId";
        type: "bytes32";
      },
      {
        indexed: false;
        internalType: "bytes32[]";
        name: "keyTuple";
        type: "bytes32[]";
      }
    ];
    name: "StoreDeleteRecord";
    type: "event";
  },
  {
    anonymous: false;
    inputs: [
      {
        indexed: false;
        internalType: "bytes32";
        name: "tableId";
        type: "bytes32";
      },
      {
        indexed: false;
        internalType: "bytes32[]";
        name: "keyTuple";
        type: "bytes32[]";
      },
      {
        indexed: false;
        internalType: "bytes";
        name: "data";
        type: "bytes";
      }
    ];
    name: "StoreEphemeralRecord";
    type: "event";
  },
  {
    anonymous: false;
    inputs: [
      {
        indexed: false;
        internalType: "bytes32";
        name: "tableId";
        type: "bytes32";
      },
      {
        indexed: false;
        internalType: "bytes32[]";
        name: "keyTuple";
        type: "bytes32[]";
      },
      {
        indexed: false;
        internalType: "uint8";
        name: "fieldIndex";
        type: "uint8";
      },
      {
        indexed: false;
        internalType: "bytes";
        name: "data";
        type: "bytes";
      }
    ];
    name: "StoreSetField";
    type: "event";
  },
  {
    anonymous: false;
    inputs: [
      {
        indexed: false;
        internalType: "bytes32";
        name: "tableId";
        type: "bytes32";
      },
      {
        indexed: false;
        internalType: "bytes32[]";
        name: "keyTuple";
        type: "bytes32[]";
      },
      {
        indexed: false;
        internalType: "bytes";
        name: "data";
        type: "bytes";
      }
    ];
    name: "StoreSetRecord";
    type: "event";
  }
];
export default abi;
