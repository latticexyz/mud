import {
  formatHex,
  hexStringToUint8Array,
  Uint8ArrayToHexString,
  concatUint8Arrays,
  splitUint8Arrays,
  Int32ArrayToUint8Array,
  Uint8ArrayToInt32Array,
  ethAddressToUint8Array,
} from "./bytes";
import { random } from "./random";

const NUM_TESTS = 1000;

describe("bytes", () => {
  describe("Uint8ArrayToHexString", () => {
    it("should be the inverse of hexStringToUint8Array", () => {
      for (let i = 0; i < NUM_TESTS; i++) {
        const hex = formatHex(random(Number.MAX_SAFE_INTEGER).toString(16));
        expect(Uint8ArrayToHexString(hexStringToUint8Array(hex))).toBe(hex);
      }
    });
  });

  describe("hexStringToUint8Array", () => {
    it("should be the inverse of Uint8ArrayToHexString", () => {
      for (let i = 0; i < NUM_TESTS; i++) {
        const uint8arr = hexStringToUint8Array(formatHex(random(Number.MAX_SAFE_INTEGER).toString(16)));
        expect(hexStringToUint8Array(Uint8ArrayToHexString(uint8arr))).toEqual(uint8arr);
      }
    });
  });

  describe("concatUint8Arrays", () => {
    it("should concat Uint8Arrays", () => {
      const arr1 = [123, 456, -134];
      const arr2 = [763, 99887, 0, 0];
      const result = [...arr1, ...arr2];
      expect(concatUint8Arrays(Uint8Array.from(arr1), Uint8Array.from(arr2))).toEqual(Uint8Array.from(result));
    });
  });

  describe("splitUint8Arrays", () => {
    it("should split Uint8Arrays", () => {
      const arr1 = [123, 456, -134];
      const arr2 = [763, 99887, 0, 0];
      const result = [...arr1, ...arr2];
      expect(splitUint8Arrays(Uint8Array.from(result), [3, 4])).toEqual([Uint8Array.from(arr1), Uint8Array.from(arr2)]);
      expect(splitUint8Arrays(Uint8Array.from(result), [4, 3])).toEqual([
        Uint8Array.from([123, 456, -134, 763]),
        Uint8Array.from([99887, 0, 0]),
      ]);
    });
  });

  describe("Uint8ArrayToInt32Array", () => {
    it("should be the inverse of Int32ArrayToUint8Array", () => {
      const input = [123, -456, 0, 2 ** 31 - 1, -1 * 2 ** 31];
      const bytes = Int32ArrayToUint8Array(input);
      expect(Uint8ArrayToInt32Array(bytes)).toEqual(input);
    });
  });

  describe("Int32ArrayToUint8Array", () => {
    it("should be the inverse of Uint8ArrayToInt32Array", () => {
      const input = [123, -456, 0, 2 ** 31 - 1, -1 * 2 ** 31];
      const bytes = Int32ArrayToUint8Array(input);
      expect(Int32ArrayToUint8Array(Uint8ArrayToInt32Array(bytes))).toEqual(bytes);
    });
  });

  describe("ethAddressToUint8Array", () => {
    it("should produce a 160bit Uint8Array", () => {
      expect(ethAddressToUint8Array("0x00").length).toBe(20);
    });
  });
});
