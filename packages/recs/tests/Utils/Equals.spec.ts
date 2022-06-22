import { SuperSet } from "../../src/v1/Utils";
import { setEquals, setMapEquals } from "../../src/v1/Utils/Equals";
import { SuperSetMap } from "../../src/v1/Utils/SuperSetMap";

describe("setEquals", () => {
  it("should return true for equal Sets", () => {
    expect(setEquals([1, 2, 3, 4], new Set([2, 3, 4, 1]))).toBe(true);
    expect(
      setEquals(
        new SuperSet({ parent: new SuperSet({ values: [1, 2] }), child: new Set([3, 4]) }),
        new Set([1, 2, 3, 4])
      )
    ).toBe(true);
    expect(
      setEquals(new SuperSet({ parent: new SuperSet({ values: [1, 2] }), child: new Set([3, 4]) }), [1, 2, 3, 4])
    ).toBe(true);
    expect(
      setEquals(
        new SuperSet({
          parent: new SuperSet({ parent: new SuperSet({ child: new Set([1]) }), values: [2] }),
          child: new Set([3, 4]),
        }),
        new Set([1, 2, 3, 4])
      )
    ).toBe(true);
  });

  it("should return false for unequal Sets", () => {
    expect(setEquals([1, 2, 3, 4, 5], new Set([2, 3, 4, 1]))).toBe(false);
    expect(
      setEquals(new SuperSet({ parent: new SuperSet({ values: [1] }), child: new Set([3, 4]) }), new Set([1, 2, 3, 4]))
    ).toBe(false);
    expect(
      setEquals(new SuperSet({ parent: new SuperSet({ values: [2, 2] }), child: new Set([3, 4]) }), [1, 2, 3, 4])
    ).toBe(false);
    expect(
      setEquals(
        new SuperSet({
          parent: new SuperSet({ parent: new SuperSet({ child: new Set([1]) }), values: [2] }),
          child: new Set([3, 4]),
        }),
        new Set([1, 2, 3, 5])
      )
    ).toBe(false);
  });
});

describe("setMapEquals", () => {
  it("should return true for equal SetMaps", () => {
    expect(
      setMapEquals<string, number>(
        [
          ["a", [1]],
          ["b", [2, 3]],
        ],
        new Map<string, Set<number>>([
          ["a", new Set([1])],
          ["b", new Set([2, 3])],
        ])
      )
    ).toBe(true);
    expect(
      setMapEquals<string, number>(
        [
          ["a", new Set([1])],
          ["b", new Set([2, 3])],
        ],
        new SuperSetMap<string, number>({
          parent: new SuperSetMap({ child: new Map([["a", new Set([1])]]) }),
          child: new Map([["b", new Set([2, 3])]]),
        })
      )
    ).toBe(true);
    expect(
      setMapEquals<string, number>(
        [
          ["a", [1]],
          ["b", [2, 3]],
        ],
        new SuperSetMap<string, number>({
          parent: new SuperSetMap({ child: new Map([["a", new Set([1])]]) }),
          child: new Map([["b", new Set([2, 3])]]),
        })
      )
    ).toBe(true);
  });
  it("should return false for unequal SetMaps", () => {
    expect(
      setMapEquals<string, number>(
        [
          ["a", [1]],
          ["b", []],
        ],
        new Map<string, Set<number>>([
          ["a", new Set([1])],
          ["b", new Set([2, 3])],
        ])
      )
    ).toBe(false);
    expect(
      setMapEquals<string, number>(
        [
          ["c", new Set([1])],
          ["b", new Set([2, 3])],
        ],
        new SuperSetMap<string, number>({
          parent: new SuperSetMap({ child: new Map([["a", new Set([1])]]) }),
          child: new Map([["b", new Set([2, 3])]]),
        })
      )
    ).toBe(false);
    expect(
      setMapEquals<string, number>(
        [
          ["a", [1]],
          ["b", [2, 3]],
        ],
        new SuperSetMap<string, number>({
          parent: new SuperSetMap({ child: new Map([["a", new Set([1])]]) }),
          child: new Map([["b", new Set([2])]]),
        })
      )
    ).toBe(false);
  });
});
