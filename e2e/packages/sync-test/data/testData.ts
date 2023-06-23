import { Data } from "./types";

/**
 * Insert more test cases here
 */

export const testData1 = {
  Number: [{ key: { key: 1 }, value: { value: 42 } }],
} satisfies Data;

export const testData2 = {
  Number: [
    { key: { key: 1 }, value: { value: 24 } },
    { key: { key: 2 }, value: { value: 1337 } },
  ],
} satisfies Data;
