import { pack, unpack } from "./pack";

describe("pack", () => {
  it("should pack multiple numbers into one 32 bit integer", () => {
    const packed = pack([1, 2], [8, 24]);
    expect(packed).toBe(parseInt("1000000000000000000000010", 2));
  });

  it("should be the inverse of unpack", () => {
    const bits = [8, 24];
    const numbers = [16777218, 2072396467, -1];

    for (const nums of numbers) {
      expect(pack(unpack(nums, bits), bits)).toEqual(nums);
    }
  });
});

describe("unpack", () => {
  it("should unpack a packed 32 bit integer into multiple numbers", () => {
    const unpacked = unpack(parseInt("1000000000000000000000010", 2), [8, 24]);
    expect(unpacked).toEqual([1, 2]);
  });

  it("should be the inverse of pack", () => {
    const bits = [8, 24];
    const numbers = [
      [1, 2],
      [123, 8798899],
      [2 ** 8 - 1, 2 ** 24 - 1],
    ];

    for (const nums of numbers) {
      expect(unpack(pack(nums, bits), bits)).toEqual(nums);
    }
  });
});
