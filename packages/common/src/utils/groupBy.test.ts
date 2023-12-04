import { describe, expect, it } from "vitest";
import { groupBy } from "./groupBy";

describe("groupBy", () => {
  it("should group values by key", () => {
    const records = [
      { type: "cat", name: "Bob" },
      { type: "cat", name: "Spot" },
      { type: "dog", name: "Rover" },
    ];
    expect(groupBy(records, (record) => record.type)).toMatchInlineSnapshot(`
      Map {
        "cat" => [
          {
            "name": "Bob",
            "type": "cat",
          },
          {
            "name": "Spot",
            "type": "cat",
          },
        ],
        "dog" => [
          {
            "name": "Rover",
            "type": "dog",
          },
        ],
      }
    `);
  });
});
