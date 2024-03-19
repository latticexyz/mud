import { defineWorld } from "@latticexyz/world/config/v2";

export default defineWorld({
  tables: {
    Number: {
      schema: {
        key: "uint32",
        value: "uint32",
      },
      key: ["key"],
    },
    Vector: {
      schema: {
        key: "uint32",
        x: "int32",
        y: "int32",
      },
      key: ["key"],
    },
    NumberList: {
      schema: {
        value: "uint32[]",
      },
      key: [],
    },
    Multi: {
      schema: {
        a: "uint32",
        b: "bool",
        c: "uint256",
        d: "int120",
        num: "int256",
        value: "bool",
      },
      key: ["a", "b", "c", "d"],
    },
    Position: {
      schema: {
        zone: "bytes32",
        x: "int32",
        y: "int32",
        player: "address",
      },
      key: ["zone", "x", "y"],
    },
    StaticArray: {
      schema: "uint256[3]",
      key: [],
    },
  },
});
