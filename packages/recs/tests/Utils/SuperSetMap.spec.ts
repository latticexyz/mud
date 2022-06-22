import { reaction } from "mobx";
import { setEquals, setMapEquals } from "../../src/v1/Utils/Equals";
import { SuperSetMap } from "../../src/v1/Utils/SuperSetMap";

describe("SuperSetMap", () => {
  let parent: SuperSetMap<string, number>;
  let extended: SuperSetMap<string, number>;

  beforeEach(() => {
    parent = new SuperSetMap<string, number>();
    extended = new SuperSetMap<string, number>({ parent });
  });

  it("changes to parent should be observable", () => {
    let changed = 0;
    reaction(
      () => extended.flat(),
      () => {
        changed++;
      }
    );

    expect(changed).toBe(0);
    parent.add("a", 1);
    expect(changed).toBe(1);
    parent.add("a", 2);
    expect(changed).toBe(2);
  });

  it("changes to child should be observable", () => {
    let changed = 0;
    reaction(
      () => extended.flat(),
      () => {
        changed++;
      }
    );

    expect(changed).toBe(0);
    extended.add("a", 1);
    expect(changed).toBe(1);
    extended.add("a", 2);
    expect(changed).toBe(2);
  });

  describe("size", () => {
    it("should return the combined size of parent and child", () => {
      parent.add("a", 1);
      extended.add("b", 1);
      expect(parent.size).toBe(1);
      expect(extended.size).toBe(2);
    });

    it("should handle overlaps of parent and child", () => {
      parent.add("a", 1);
      extended.add("a", 2);
      expect(parent.size).toBe(1);
      expect(extended.size).toBe(1);
    });
  });

  describe("add", () => {
    it("should no nothing if the parent already includes the value", () => {
      parent.add("a", 1);
      for (const val of extended.values()) {
        expect(setEquals(val, [1])).toBe(true);
      }
      extended.add("a", 1);
      for (const val of extended.values()) {
        expect(setEquals(val, [1])).toBe(true);
      }
    });

    it("should no nothing if the child already includes the value", () => {
      extended.add("a", 1);
      for (const val of extended.values()) {
        expect(setEquals(val, [1])).toBe(true);
      }
      extended.add("a", 1);
      for (const val of extended.values()) {
        expect(setEquals(val, [1])).toBe(true);
      }
    });

    it("should create a new child set if it does not exist yet", () => {
      expect(extended.size).toBe(0);
      extended.add("a", 1);
      expect(extended.size).toBe(1);
    });

    it("should add the value to the child set if it is not in the parent or child set yet", () => {
      parent.add("a", 1);
      extended.add("a", 2);

      for (const val of parent.values()) {
        expect(setEquals(val, [1])).toBe(true);
      }

      for (const val of extended.values()) {
        expect(setEquals(val, [1, 2])).toBe(true);
      }
    });
  });

  describe("clear", () => {
    it("should clear the child set", () => {
      parent.add("a", 1);
      extended.add("a", 2);
      extended.add("b", 2);

      expect(
        setMapEquals(extended, [
          ["a", [1, 2]],
          ["b", [2]],
        ])
      ).toBe(true);

      extended.clear();
      expect(setMapEquals(extended, [["a", [1]]])).toBe(true);
    });

    it("should leave the parent set untouched", () => {
      parent.add("a", 1);
      extended.add("a", 2);
      extended.add("b", 2);

      expect(setMapEquals(parent, [["a", [1]]])).toBe(true);

      extended.clear();
      expect(setMapEquals(parent, [["a", [1]]])).toBe(true);
    });
  });

  describe("delete", () => {
    it("should delete the set at the given key from the child", () => {
      parent.add("a", 1);
      extended.add("a", 2);
      extended.add("b", 2);

      expect(
        setMapEquals(extended, [
          ["a", [1, 2]],
          ["b", [2]],
        ])
      ).toBe(true);

      extended.delete("a");

      expect(
        setMapEquals(extended, [
          ["a", [1]],
          ["b", [2]],
        ])
      ).toBe(true);
    });

    it("should leave the parent set untouched", () => {
      parent.add("a", 1);
      extended.add("a", 2);
      extended.add("b", 2);

      expect(setMapEquals(parent, [["a", [1]]])).toBe(true);

      extended.delete("a");
      expect(setMapEquals(parent, [["a", [1]]])).toBe(true);
    });
  });

  describe("deleteValue", () => {
    it("should delete the value from the child set", () => {
      parent.add("a", 1);
      extended.add("a", 2);
      extended.add("b", 2);

      expect(
        setMapEquals(extended, [
          ["a", [1, 2]],
          ["b", [2]],
        ])
      ).toBe(true);

      extended.deleteValue("a", 2);
      expect(
        setMapEquals(extended, [
          ["a", [1]],
          ["b", [2]],
        ])
      ).toBe(true);
    });

    it("should leave the parent set untouched", () => {
      parent.add("a", 1);
      extended.add("a", 2);
      extended.add("b", 2);
      expect(setMapEquals(parent, [["a", [1]]])).toBe(true);

      extended.deleteValue("a", 1);

      expect(setMapEquals(parent, [["a", [1]]])).toBe(true);
    });
  });

  describe("get", () => {
    it("should return a combined set including parent and child values", () => {
      parent.add("a", 1);
      extended.add("a", 2);
      expect(setEquals(extended.get("a"), [1, 2]));
    });
  });

  describe("has", () => {
    it("should return true if the key exists in the parent map", () => {
      parent.add("a", 2);
      expect(extended.has("a")).toBe(true);
    });
    it("should return true if the key exists in the child map", () => {
      extended.add("b", 2);
      expect(extended.has("b")).toBe(true);
    });
    it("should return false if the key does neither exists in the parent nor child map", () => {
      parent.add("a", 2);
      extended.add("b", 2);
      expect(extended.has("c")).toBe(false);
    });
  });

  describe("hasValue", () => {
    it("should return true if the value exist in the parent set", () => {
      parent.add("a", 2);
      expect(extended.hasValue("a", 2)).toBe(true);
    });
    it("should return true if the value exist in the child set", () => {
      extended.add("b", 3);
      expect(extended.hasValue("b", 3)).toBe(true);
    });
    it("should return false if the value exist neither in the parent nor child set", () => {
      parent.add("a", 2);
      extended.add("b", 3);
      expect(extended.hasValue("a", 3)).toBe(false);
    });
  });

  describe("entries", () => {
    it("should return an iterator over all keys and combined values of parent and child", () => {
      parent.add("a", 1);
      parent.add("a", 3);
      parent.add("c", 4);
      extended.add("a", 1);
      extended.add("a", 2);
      extended.add("b", 2);

      const parentEntries = [...parent.entries()];
      expect(parentEntries[0][0] == "a" && setEquals(parentEntries[0][1], new Set([1, 3]))).toBe(true);
      expect(parentEntries[1][0] == "c" && setEquals(parentEntries[1][1], new Set([4]))).toBe(true);

      const extendedEntries = [...extended.entries()];
      expect(extendedEntries[0][0] == "a" && setEquals(extendedEntries[0][1], new Set([1, 2, 3]))).toBe(true);
      expect(extendedEntries[1][0] == "b" && setEquals(extendedEntries[1][1], new Set([2]))).toBe(true);
      expect(extendedEntries[2][0] == "c" && setEquals(extendedEntries[2][1], new Set([4]))).toBe(true);
    });
  });

  describe("keys", () => {
    it("should return an iterator over all keys of parent and child", () => {
      parent.add("a", 1);
      extended.add("a", 1);
      extended.add("a", 2);
      extended.add("b", 2);
      expect([...parent.keys()]).toEqual(["a"]);
      expect([...extended.keys()]).toEqual(["a", "b"]);
    });
  });

  describe("values", () => {
    it("should return an iterator over all combined values of parent and child", () => {
      parent.add("a", 1);
      parent.add("a", 3);
      extended.add("a", 1);
      extended.add("a", 2);
      extended.add("b", 2);

      const parentValues = [...parent.values()];
      expect(setEquals(parentValues[0], new Set([1, 3]))).toBe(true);

      const extendedValues = [...extended.values()];
      expect(setEquals(extendedValues[0], new Set([1, 2, 3]))).toBe(true);
      expect(setEquals(extendedValues[1], new Set([2]))).toBe(true);

      expect([...parent.flat().values()]).toEqual([new Set([1, 3])]);
      expect([...extended.flat().values()]).toEqual([new Set([1, 2, 3]), new Set([2])]);
    });
  });

  describe("flat", () => {
    it("should return a flat representation of the SuperSetMap", () => {
      parent.add("a", 1);
      extended.add("b", 2);
      expect(extended.flat()).toEqual(
        new Map([
          ["a", new Set([1])],
          ["b", new Set([2])],
        ])
      );
    });
  });
});
