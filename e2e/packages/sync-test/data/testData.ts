import { Data } from "./types";

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
