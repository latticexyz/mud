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
    Name: {
      keySchema: { user: "address" },
      schema: { name: "string" },
    },
    Data: {
      keySchema: { key: "bytes32" },
      schema: { value: "bytes" },
    },

    // -------------- WORDS3 CONFIG ----------------
    GameConfig: {
      keySchema: {},
      schema: {
        status: "uint8",
        maxWords: "uint16",
        wordsPlayed: "uint16",
      },
    },
    MerkleRootConfig: {
      keySchema: {},
      schema: {
        value: "bytes32",
      },
    },
    VRGDAConfig: {
      keySchema: {},
      schema: {
        startTime: "uint256",
        targetPrice: "int256",
        priceDecay: "int256",
        perDay: "int256",
      },
    },
    TileLetter: {
      keySchema: { x: "int32", y: "int32" },
      schema: {
        value: "uint8",
      },
    },
    TilePlayer: {
      keySchema: { x: "int32", y: "int32" },
      schema: {
        value: "address",
      },
    },
    Treasury: {
      keySchema: {},
      schema: {
        value: "uint256",
      },
    },
    Points: {
      keySchema: { player: "address" },
      schema: {
        value: "uint32",
      },
    },
    LetterCount: {
      keySchema: { letter: "uint8" },
      schema: {
        value: "uint32",
      },
    },
  },
});
