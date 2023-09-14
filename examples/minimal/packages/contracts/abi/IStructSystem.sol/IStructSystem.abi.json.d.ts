declare const abi: [
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes";
            name: "value";
            type: "bytes";
          }
        ];
        internalType: "struct BytesStruct[]";
        name: "";
        type: "tuple[]";
      }
    ];
    name: "dynamicArrayBytesStruct";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string";
            name: "value";
            type: "string";
          }
        ];
        internalType: "struct StringStruct[]";
        name: "";
        type: "tuple[]";
      }
    ];
    name: "dynamicArrayStringStruct";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes";
            name: "value";
            type: "bytes";
          }
        ];
        internalType: "struct BytesStruct[1]";
        name: "";
        type: "tuple[1]";
      }
    ];
    name: "staticArrayBytesStruct";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string";
            name: "value";
            type: "string";
          }
        ];
        internalType: "struct StringStruct[1]";
        name: "";
        type: "tuple[1]";
      }
    ];
    name: "staticArrayStringStruct";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  }
];
export default abi;
