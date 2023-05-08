import { expect, test } from "vitest";
import { mudConfig } from ".";

test("mudConfig requires unique table names", () => {
  expect(() =>
    mudConfig({
      tables: {
        Table: {
          name: "Table",
          schema: "uint256",
        },
        Table2: {
          name: "Table",
          schema: "uint256",
        },
      },
    })
  ).toThrowError(/StoreConfig Validation Error.*\n.*- Table names must be unique: Table/);
});
