import { arrayToIterator, mergeIterators } from "./iterable";

describe("arrayToIterator", () => {
  it("should return an iterable iterator with the same content as the array", () => {
    const array = ["a", "b", "c", 1, 2, 3];
    const iterator = arrayToIterator(array);
    expect([...iterator]).toEqual(array);
  });

  it("should not return a next value if the array is empty", () => {
    const array: string[] = [];
    const iterator = arrayToIterator(array);
    expect([...iterator]).toEqual(array);

    const mock = jest.fn();
    for (const item of iterator) {
      mock(item);
    }
    expect(mock).not.toHaveBeenCalled();
  });

  it("should not be possible to iterate over an iterator multiple times", () => {
    const array = ["a", "b", "c", 1, 2, 3];
    const iterator = arrayToIterator(array);
    expect([...iterator]).toEqual(array);
    expect([...iterator]).toEqual([]);
  });
});

describe("mergeIterators", () => {
  it("should return a merged iterator", () => {
    const a = arrayToIterator(["a", "b", "c"]);
    const b = arrayToIterator([1, 2, 3]);
    expect([...mergeIterators(a, b)]).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
  });

  it("should work with iterators of unequal length", () => {
    const a = arrayToIterator(["a"]);
    const b = arrayToIterator([1, 2, 3]);
    expect([...mergeIterators(a, b)]).toEqual([
      ["a", 1],
      [null, 2],
      [null, 3],
    ]);
  });

  it("should return an empty iterator if both inputs are empty", () => {
    const a = arrayToIterator([]);
    const b = arrayToIterator([]);
    expect([...mergeIterators(a, b)]).toEqual([]);
  });
});
