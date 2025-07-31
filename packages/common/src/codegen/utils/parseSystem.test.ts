import { describe, expect, it } from "vitest";
import { parseSystem } from "./parseSystem";

describe("parseSystem", () => {
  it("returns undefined if the contract is not found", () => {
    expect(parseSystem("contract Foo {}", "System")).toBeUndefined();
  });

  it("returns contract type when the name ends with 'System'", () => {
    expect(parseSystem("contract TestSystem {}", "TestSystem")).toStrictEqual({ contractType: "contract" });
  });

  it("returns abstract type when the name ends with 'System'", () => {
    expect(parseSystem("abstract contract TestSystem {}", "TestSystem")).toStrictEqual({ contractType: "abstract" });
  });

  it("returns undefined for interaces", () => {
    expect(parseSystem("interface TestSystem {}", "TestSystem")).toBeUndefined();
  });

  it("returns the contract type if the contract extends the base system", () => {
    const source = `
import { System } from "@latticexyz/world/src/System.sol";
contract Test is System {}
`;
    expect(parseSystem(source, "Test")).toStrictEqual({ contractType: "contract" });
  });
});
