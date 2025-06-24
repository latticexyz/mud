/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, it, vi } from "vitest";
import { dropValue, parseJson } from "./parseJson";

describe("parseJson", async () => {
  it("can stream json", async () => {
    const value = {
      nullish: null,
      stringish: "foobar",
      booleanish: true,
      numberish: 420,
      objectish: {
        nested: {
          child: {
            list: [1, 2, 3],
          },
        },
      },
      toBeDropped: "dropped",
      arrayish: [true, false, 1, 2, 3, "yes", [], null],
      lists: [[], [], [[], [], [[], [[[[]]]], []]]],
    };

    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(value)));
        controller.close();
      },
    });

    const calls: unknown[][] = [];
    const result = await parseJson(
      body,
      vi.fn<Exclude<Parameters<typeof parseJson>[1], undefined>>((path, value) => {
        calls.push([path, value]);
        if (path === ".toBeDropped") {
          return dropValue;
        }
      }),
    );

    const { toBeDropped, ...expectedValue } = value;
    expect(result).toEqual(expectedValue);

    expect(calls).toMatchInlineSnapshot(`
      [
        [
          ".nullish",
          null,
        ],
        [
          ".stringish",
          "foobar",
        ],
        [
          ".booleanish",
          true,
        ],
        [
          ".numberish",
          420,
        ],
        [
          ".objectish.nested.child.list.*",
          1,
        ],
        [
          ".objectish.nested.child.list.*",
          2,
        ],
        [
          ".objectish.nested.child.list.*",
          3,
        ],
        [
          ".objectish.nested.child.list",
          [
            1,
            2,
            3,
          ],
        ],
        [
          ".objectish.nested.child",
          {
            "list": [
              1,
              2,
              3,
            ],
          },
        ],
        [
          ".objectish.nested",
          {
            "child": {
              "list": [
                1,
                2,
                3,
              ],
            },
          },
        ],
        [
          ".objectish",
          {
            "nested": {
              "child": {
                "list": [
                  1,
                  2,
                  3,
                ],
              },
            },
          },
        ],
        [
          ".toBeDropped",
          "dropped",
        ],
        [
          ".arrayish.*",
          true,
        ],
        [
          ".arrayish.*",
          false,
        ],
        [
          ".arrayish.*",
          1,
        ],
        [
          ".arrayish.*",
          2,
        ],
        [
          ".arrayish.*",
          3,
        ],
        [
          ".arrayish.*",
          "yes",
        ],
        [
          ".arrayish.*",
          [],
        ],
        [
          ".arrayish.*",
          null,
        ],
        [
          ".arrayish",
          [
            true,
            false,
            1,
            2,
            3,
            "yes",
            [],
            null,
          ],
        ],
        [
          ".lists.*",
          [],
        ],
        [
          ".lists.*",
          [],
        ],
        [
          ".lists.*.*",
          [],
        ],
        [
          ".lists.*.*",
          [],
        ],
        [
          ".lists.*.*.*",
          [],
        ],
        [
          ".lists.*.*.*.*.*.*",
          [],
        ],
        [
          ".lists.*.*.*.*.*",
          [
            [],
          ],
        ],
        [
          ".lists.*.*.*.*",
          [
            [
              [],
            ],
          ],
        ],
        [
          ".lists.*.*.*",
          [
            [
              [
                [],
              ],
            ],
          ],
        ],
        [
          ".lists.*.*.*",
          [],
        ],
        [
          ".lists.*.*",
          [
            [],
            [
              [
                [
                  [],
                ],
              ],
            ],
            [],
          ],
        ],
        [
          ".lists.*",
          [
            [],
            [],
            [
              [],
              [
                [
                  [
                    [],
                  ],
                ],
              ],
              [],
            ],
          ],
        ],
        [
          ".lists",
          [
            [],
            [],
            [
              [],
              [],
              [
                [],
                [
                  [
                    [
                      [],
                    ],
                  ],
                ],
                [],
              ],
            ],
          ],
        ],
      ]
    `);
  });
});
