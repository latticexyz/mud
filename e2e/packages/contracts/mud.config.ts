import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    Number: {
      keySchema: {
        key: "uint32",
      },
      valueSchema: {
        value: "uint32",
      },
    },
    Vector: {
      keySchema: {
        key: "uint32",
      },
      valueSchema: {
        x: "int32",
        y: "int32",
      },
    },
    NumberList: {
      keySchema: {},
      valueSchema: {
        value: "uint32[]",
      },
    },
    Multi: {
      keySchema: {
        a: "uint32",
        b: "bool",
        c: "uint256",
        d: "int120",
      },
      valueSchema: {
        num: "int256",
        value: "bool",
      },
    },
    Position: {
      keySchema: {
        zone: "bytes32",
        x: "int32",
        y: "int32",
      },
      valueSchema: {
        player: "address",
      },
    },
  },
});
