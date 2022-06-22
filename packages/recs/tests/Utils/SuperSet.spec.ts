import { reaction } from "mobx";
import { SuperSet } from "../../src/v1/Utils";

describe("SuperSet", () => {
  let parent: SuperSet<number>;
  let extendedSet: SuperSet<number>;

  beforeEach(() => {
    parent = new SuperSet<number>();
    extendedSet = new SuperSet({ parent });
  });

  it("changes to parent should be observable", () => {
    let changed = 0;

    reaction(
      () => extendedSet.has(1),
      () => {
        changed++;
      }
    );

    expect(changed).toBe(0);

    parent.add(1);
    expect(changed).toBe(1);
    expect(extendedSet.has(1)).toBe(true);
    expect(parent.has(1)).toBe(true);

    parent.delete(1);
    expect(changed).toBe(2);
    expect(extendedSet.has(1)).toBe(false);
    expect(parent.has(1)).toBe(false);
  });

  it("changes to extendedSet should be observable", () => {
    let changed = 0;
    reaction(
      () => extendedSet.has(1),
      () => {
        changed++;
      }
    );

    expect(changed).toBe(0);
    extendedSet.add(1);
    expect(changed).toBe(1);
  });

  describe("add", () => {
    it("should add the given value to the extended set but not the parent set", () => {
      extendedSet.add(1);
      expect(extendedSet.has(1)).toBe(true);
      expect(parent.has(1)).toBe(false);
    });

    it("should not add the given value to the extended set if it is already included in the parent set", () => {
      parent.add(1);
      extendedSet.add(1);
      expect(extendedSet.size).toBe(1);
    });
  });

  describe("has", () => {
    it("should return true if the parent set has the value", () => {
      parent.add(1);
      expect(extendedSet.has(1)).toBe(true);
    });

    it("should return true if the extended set has the value", () => {
      extendedSet.add(1);
      expect(extendedSet.has(1)).toBe(true);
    });
  });

  describe("size", () => {
    it("should return the combined size of the parent and extended set", () => {
      parent.add(4);
      extendedSet.add(8);

      expect(parent.size).toBe(1);
      expect(extendedSet.size).toBe(2);
    });
  });

  describe("values", () => {
    it("should iterate through values of parent and extended set", () => {
      const parentValues = [1, 2, 3];
      const extendedValues = [4, 5, 6];

      for (const val of parentValues) {
        parent.add(val);
      }

      for (const val of extendedValues) {
        extendedSet.add(val);
      }

      expect(Array.from(extendedSet.values())).toEqual([...extendedValues, ...parentValues]);
    });
  });

  describe("entries", () => {
    it("should iterate through entries of parent and extended set", () => {
      const parentValues = [1, 2, 3];
      const extendedValues = [4, 5, 6];

      for (const val of parentValues) {
        parent.add(val);
      }

      for (const val of extendedValues) {
        extendedSet.add(val);
      }

      expect(Array.from(extendedSet.entries())).toEqual([
        ...extendedValues.map((v) => [v, v]),
        ...parentValues.map((v) => [v, v]),
      ]);
    });
  });

  describe("forEach", () => {
    it("should iterate through the values of parent and extended set", () => {
      const parentValues = [1, 2, 3];
      const extendedValues = [4, 5, 6];

      for (const val of parentValues) {
        parent.add(val);
      }

      for (const val of extendedValues) {
        extendedSet.add(val);
      }

      const result: number[] = [];
      extendedSet.forEach((num) => {
        result.push(num);
      });

      expect(result).toEqual([...extendedValues, ...parentValues]);
    });
  });

  describe("for ... of", () => {
    it("should iterate through the values of parent and extended set", () => {
      const parentValues = [1, 2, 3];
      const extendedValues = [4, 5, 6];

      for (const val of parentValues) {
        parent.add(val);
      }

      for (const val of extendedValues) {
        extendedSet.add(val);
      }

      const result: number[] = [];
      for (const num of extendedSet) {
        result.push(num);
      }

      expect(result).toEqual([...extendedValues, ...parentValues]);
    });
  });

  describe("flat", () => {
    it("should return a flat representation of the superset", () => {
      parent.add(1);
      extendedSet.add(2);
      expect(extendedSet.flat()).toEqual(new Set([1, 2]));
    });
  });
});
