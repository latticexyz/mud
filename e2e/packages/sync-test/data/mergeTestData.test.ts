import { describe, expect, it } from "vitest";
import { Data } from "./types";
import { mergeTestData } from "./mergeTestData";

describe("mergeTestData", () => {
  it("should merge two data objects by deduplicating keys", () => {
    const data1 = {
      Number: [
        { key: { key: 1 }, value: { value: 2 } },
        { key: { key: 2 }, value: { value: 2 } },
      ],
      Vector: [
        { key: { key: 1 }, value: { x: 1, y: 2 } },
        { key: { key: 2 }, value: { x: 1, y: 2 } },
      ],
    } satisfies Data;

    const data2 = {
      Number: [
        { key: { key: 2 }, value: { value: 3 } },
        { key: { key: 3 }, value: { value: 3 } },
      ],
      Vector: [
        { key: { key: 2 }, value: { x: 1, y: 3 } },
        { key: { key: 3 }, value: { x: 1, y: 3 } },
      ],
    } satisfies Data;

    expect(mergeTestData(data1, data2)).toStrictEqual({
      Number: [
        { key: { key: 1 }, value: { value: 2 } },
        { key: { key: 2 }, value: { value: 3 } },
        { key: { key: 3 }, value: { value: 3 } },
      ],
      Vector: [
        { key: { key: 1 }, value: { x: 1, y: 2 } },
        { key: { key: 2 }, value: { x: 1, y: 3 } },
        { key: { key: 3 }, value: { x: 1, y: 3 } },
      ],
    });
  });
});
