import { reaction } from "mobx";
import { SuperMap } from "../../src/Utils";

describe("SuperMap", () => {
  let parent: SuperMap<string, number>;
  let extendedMap: SuperMap<string, number>;

  beforeEach(() => {
    parent = new SuperMap<string, number>();
    extendedMap = new SuperMap({ parent });
  });

  it("changes to the parent should be observable", () => {
    let changed = 0;

    reaction(
      () => Array.from(extendedMap.entries()),
      () => {
        changed++;
      }
    );

    expect(changed).toBe(0);
    parent.set("1", 1);
    expect(changed).toBe(1);
    expect(extendedMap.has("1")).toBe(true);
    expect(parent.has("1")).toBe(true);
  });

  it("changes to the extended map should be observable", () => {
    let changed = 0;

    reaction(
      () => Array.from(extendedMap.entries()),
      () => {
        changed++;
      }
    );

    expect(changed).toBe(0);
    extendedMap.set("1", 1);
    expect(changed).toBe(1);
    expect(extendedMap.has("1")).toBe(true);
    expect(parent.has("1")).toBe(false);
  });

  describe("set", () => {
    it("should set the given value in the extended map", () => {
      const key = "key";
      const value = 1;
      extendedMap.set(key, value);
      expect(extendedMap.get(key)).toBe(value);
      expect(parent.get(key)).toBe(undefined);
    });

    it("should override the parent map's value in the extended map", () => {
      const key = "key";
      const value = 1;
      const value2 = 2;
      parent.set(key, value);
      expect(parent.get(key)).toBe(value);
      expect(extendedMap.get(key)).toBe(value);

      extendedMap.set(key, value2);
      expect(extendedMap.size).toBe(1);
      expect(parent.get(key)).toBe(value);
      expect(extendedMap.get(key)).toBe(value2);
    });
  });

  describe("get", () => {
    it("should return the parent map's value", () => {
      const key = "key";
      const value = 1;
      parent.set(key, value);
      expect(extendedMap.get(key)).toBe(value);
    });

    it("should return the extended map's value if the extended map has the value", () => {
      const key = "key";
      const value = 1;
      parent.set(key, value);
      expect(extendedMap.get(key)).toBe(value);
    });
  });

  describe("size", () => {
    it("should return the combined size of the parent and extended map", () => {
      parent.set("1", 1);
      parent.set("2", 3);
      extendedMap.set("3", 3);
      extendedMap.set("4", 4);

      expect(parent.size).toBe(2);
      expect(extendedMap.size).toBe(4);
    });
  });

  describe("values", () => {
    it("should iterate through values of parent and extended map", () => {
      const parentValues = [1, 2, 3];
      const extendedValues = [4, 5, 6];

      for (const val of parentValues) {
        parent.set(String(val), val);
      }

      for (const val of extendedValues) {
        extendedMap.set(String(val), val);
      }

      expect(Array.from(extendedMap.values())).toEqual([...extendedValues, ...parentValues]);
    });
  });

  describe("keys", () => {
    it("should iterate through keys of parent and extended map", () => {
      const parentKeys = ["1", "2", "3"];
      const extendedKeys = ["4", "5", "6"];

      for (const key of parentKeys) {
        parent.set(key, Number(key));
      }

      for (const key of extendedKeys) {
        extendedMap.set(key, Number(key));
      }

      expect(Array.from(extendedMap.keys())).toEqual([...extendedKeys, ...parentKeys]);
    });
  });

  describe("entries", () => {
    it("should iterate through entries of parent and extended map", () => {
      const parentEntries: [string, number][] = [
        ["1", 1],
        ["2", 2],
        ["3", 3],
      ];
      const extendedEntries: [string, number][] = [
        ["4", 4],
        ["5", 5],
        ["6", 6],
      ];

      for (const [key, val] of parentEntries) {
        parent.set(key, val);
      }

      for (const [key, val] of extendedEntries) {
        extendedMap.set(key, val);
      }

      expect(Array.from(extendedMap.entries())).toEqual([...extendedEntries, ...parentEntries]);
    });

    it("should ignore parent entries if the extended map overrides it", () => {
      const parentEntries: [string, number][] = [
        ["1", 1],
        ["2", 2],
        ["3", 3],
      ];
      const extendedEntries: [string, number][] = [
        ["1", 4],
        ["5", 5],
        ["6", 6],
      ];

      for (const [key, val] of parentEntries) {
        parent.set(key, val);
      }

      for (const [key, val] of extendedEntries) {
        extendedMap.set(key, val);
      }

      expect(Array.from(extendedMap.entries())).toEqual([
        ["1", 4],
        ["5", 5],
        ["6", 6],
        ["2", 2],
        ["3", 3],
      ]);
    });
  });

  describe("forEach", () => {
    it("should iterate through the entries of parent and extended map", () => {
      const parentEntries: [string, number][] = [
        ["1", 1],
        ["2", 2],
        ["3", 3],
      ];
      const extendedEntries: [string, number][] = [
        ["4", 4],
        ["5", 5],
        ["6", 6],
      ];

      for (const [key, val] of parentEntries) {
        parent.set(key, val);
      }

      for (const [key, val] of extendedEntries) {
        extendedMap.set(key, val);
      }

      const result: [string, number][] = [];
      extendedMap.forEach((val, key) => {
        result.push([key, val]);
      });

      expect(result).toEqual([...extendedEntries, ...parentEntries]);
    });
  });

  describe("for ... of", () => {
    it("should iterate through the entries of parent and extended map", () => {
      const parentEntries: [string, number][] = [
        ["1", 1],
        ["2", 2],
        ["3", 3],
      ];
      const extendedEntries: [string, number][] = [
        ["4", 4],
        ["5", 5],
        ["6", 6],
      ];

      for (const [key, val] of parentEntries) {
        parent.set(key, val);
      }

      for (const [key, val] of extendedEntries) {
        extendedMap.set(key, val);
      }

      const result: [string, number][] = [];
      for (const [key, val] of extendedMap) {
        result.push([key, val]);
      }

      expect(result).toEqual([...extendedEntries, ...parentEntries]);
    });
  });
});
