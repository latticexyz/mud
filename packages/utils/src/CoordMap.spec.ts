import { coordToKey, keyToCoord } from "./CoordMap";

describe("CoordMap", () => {
  describe("coordToKey", () => {
    it("should be the inverse of keyToCoord", () => {
      const MAX = 2 ** 15 - 1;
      const coords = [
        { x: 1, y: 2 },
        { x: -1, y: 2 },
        { x: 1, y: -2 },
        { x: 0, y: 0 },
        { x: -1, y: -2 },
        { x: MAX, y: MAX },
        { x: -1 * MAX, y: MAX },
        { x: MAX, y: -1 * MAX },
        { x: -1 * MAX, y: -1 * MAX },
      ];

      for (const coord of coords) {
        const key = coordToKey(coord);
        expect(keyToCoord(key)).toEqual(coord);
      }
    });
  });

  describe("keyToCoord", () => {
    it("should be the inverse of coordToKey", () => {
      const keys = [
        "11111111111111110000000000000000",
        "11011101110111011000101001001000",
        "01101101101110110001010101111001",
        "11010101111011010010010010001001",
        "00111111111111110111000001001100",
        "01101110001111010110010010001001",
        "10101110011011010010010001010101",
        "01011011101011010101100100101000",
        "11011110111101111000010000100011",
        "10110111011011010101101010001001",
        "00110111011101110001000100010000",
        "10110101101101010001001010001001",
        "01100011010101111010010100110010",
        "11111111111111111111111111111111",
        "00000000000000000000000000000000",
      ];

      for (const key of keys) {
        const numKey = parseInt(key, 2) >> 0;
        const coord = keyToCoord(numKey);
        expect(coordToKey(coord)).toEqual(numKey);
      }
    });

    it("should work with {x: 0, y: 0}", () => {
      expect(keyToCoord(0)).toEqual({ x: 0, y: 0 });
    });
  });
});
