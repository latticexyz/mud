import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    Number: {
      keySchema: {
        key: "uint32",
      },
      schema: {
        value: "uint32",
      },
    },
    Vector: {
      keySchema: {
        key: "uint32",
      },
      schema: {
        x: "int32",
        y: "int32",
      },
    },
    NumberList: {
      keySchema: {},
      schema: {
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
      schema: {
        num: "int256",
        value: "bool",
      },
    },
  },
});
