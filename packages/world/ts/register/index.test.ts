import { expect, test } from "vitest";
import { mudConfig } from ".";
import { resolveWorldConfig } from "../library";

test("resolveWorldConfig requires unique table and system names", () => {
  expect(() =>
    resolveWorldConfig(
      mudConfig({
        tables: {
          Selector: {
            valueSchema: "uint256",
          },
        },
        systems: {
          Selector: {
            openAccess: false,
            accessList: [],
          },
        },
      }),
      ["Selector"]
    )
  ).toThrowError("Table and system names must be unique: Selector");
});
