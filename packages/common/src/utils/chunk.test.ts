import { describe, it, expect } from "vitest";
import { chunk } from "./chunk";

describe("chunk", () => {
  it("splits an array into chunks", () => {
    expect(Array.from(chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 3))).toMatchInlineSnapshot(`
      [
        [
          1,
          2,
          3,
        ],
        [
          4,
          5,
          6,
        ],
        [
          7,
          8,
          9,
        ],
      ]
    `);

    expect(Array.from(chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 5))).toMatchInlineSnapshot(`
    [
      [
        1,
        2,
        3,
        4,
        5,
      ],
      [
        6,
        7,
        8,
        9,
      ],
    ]
  `);

    expect(Array.from(chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 8))).toMatchInlineSnapshot(`
      [
        [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
        ],
        [
          9,
        ],
      ]
    `);

    expect(Array.from(chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 9))).toMatchInlineSnapshot(`
      [
        [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
        ],
      ]
    `);

    expect(Array.from(chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 10))).toMatchInlineSnapshot(`
      [
        [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
        ],
      ]
    `);
  });
});
