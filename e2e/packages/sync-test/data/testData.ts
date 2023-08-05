import { Data } from "./types";
import { toHex } from "viem";

/**
 * Insert more test cases here
 */

export const testData1 = {
  Number: [{ key: { key: 1 }, value: { value: 42 } }],
  Vector: [{ key: { key: 1 }, value: { x: 1, y: 2 } }],
  Multi: [
    {
      key: { a: 9999, b: true, c: BigInt(42), d: BigInt(-999) },
      value: { num: BigInt(1337), value: true },
    },
  ],
  NumberList: [{ key: {}, value: { value: [1, 2, 3] } }],
  Name: [{ key: { user: toHex(1234, { size: 20 }) }, value: { name: "some-name" } }],
  Data: [{ key: { key: toHex(1234, { size: 32 }) }, value: { value: toHex(1234, { size: 64 }) } }],
  // -------------- WORDS3 DATA ----------------
  GameConfig: [{ key: {}, value: { status: 1, maxWords: 42, wordsPlayed: 1337 } }],
  MerkleRootConfig: [{ key: {}, value: { value: toHex(1234, { size: 32 }) } }],
  VRGDAConfig: [
    {
      key: {},
      value: { startTime: BigInt(4242), targetPrice: BigInt(-42), priceDecay: BigInt(9999), perDay: BigInt(-9999) },
    },
  ],
  TileLetter: [{ key: { x: 31337, y: -31337 }, value: { value: 7 } }],
  TilePlayer: [{ key: { x: 31337, y: -31337 }, value: { value: toHex(6969, { size: 20 }) } }],
  Treasury: [{ key: {}, value: { value: BigInt(Number.MAX_SAFE_INTEGER) } }],
  Points: [{ key: { player: toHex(4242, { size: 20 }) }, value: { value: 8080 } }],
  LetterCount: [{ key: { letter: 0 }, value: { value: 99 } }],
} satisfies Data;

export const testData2 = {
  Number: [
    { key: { key: 1 }, value: { value: 24 } },
    { key: { key: 2 }, value: { value: 1337 } },
  ],
  Vector: [
    { key: { key: 1 }, value: { x: 1, y: 42 } },
    { key: { key: 32 }, value: { x: 1, y: -42 } },
  ],
  Multi: [
    {
      key: { a: 9999, b: true, c: BigInt(42), d: BigInt(-999) },
      value: { num: BigInt(31337), value: false },
    },
    {
      key: { a: 9998, b: true, c: BigInt(42), d: BigInt(-999) },
      value: { num: BigInt(0), value: true },
    },
  ],
  NumberList: [{ key: {}, value: { value: [1, 2, 3] } }],
} satisfies Data;
