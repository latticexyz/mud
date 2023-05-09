import { expect, test } from "vitest";
import { mudConfig } from ".";
import { resolveWorldConfig } from "../library";

test("resolveWorldConfig requires unique table and system names", () => {
  expect(() =>
    resolveWorldConfig(
      mudConfig({
        tables: {
          Table: {
            name: "Selector",
            schema: "uint256",
          },
        },
        overrideSystems: {
          TestSystem: {
            name: "Selector",
            openAccess: false,
            accessList: [],
          },
        },
      }),
      ["TestSystem"]
    )
  ).toThrowError("Table and system names must be unique: Selector");
});
