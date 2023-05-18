import { hexToArray } from "@latticexyz/utils";
import { decodeStaticField } from "./decodeStaticField";

describe("decodeStaticField", () => {
  describe("bool", () => {
    it("should decode with no offset", () => {
      expect(decodeStaticField("bool", new Uint8Array([0]), 0)).toEqual(false);
      expect(decodeStaticField("bool", new Uint8Array([1]), 0)).toEqual(true);
    });
    it("should decode with offset", () => {
      expect(decodeStaticField("bool", new Uint8Array([0, 0]), 1)).toEqual(false);
      expect(decodeStaticField("bool", new Uint8Array([0, 1]), 1)).toEqual(true);
    });
    it("should decode slice", () => {
      const buffer = new Uint8Array([0, 1, 2, 3]).buffer;
      expect(decodeStaticField("bool", new Uint8Array(buffer, 0, 1), 0)).toEqual(false);
      expect(decodeStaticField("bool", new Uint8Array(buffer, 1, 1), 0)).toEqual(true);
    });
    it("should decode empty array", () => {
      expect(decodeStaticField("bool", new Uint8Array(0), 0)).toEqual(false);
    });
  });

  describe("uint256", () => {
    const bytes = hexToArray("0x00000000000000000000000000000000000000000000000000000000008e216c");
    it("should decode with no offset", () => {
      expect(decodeStaticField("uint256", bytes, 0)).toEqual(9314668n);
    });
    it("should decode empty array", () => {
      expect(decodeStaticField("uint256", new Uint8Array(0), 0)).toEqual(0n);
    });
  });

  describe("address", () => {
    it("should decode empty array", () => {
      expect(decodeStaticField("address", new Uint8Array(0), 0)).toEqual("0x0000000000000000000000000000000000000000");
    });
  });

  describe("int8", () => {
    it("should decode type(int8).max", () => {
      expect(decodeStaticField("int8", hexToArray("0x7f"), 0)).toEqual(127);
    });
    it("should decode type(int8).min", () => {
      expect(decodeStaticField("int8", hexToArray("0x80"), 0)).toEqual(-128);
    });
    it("should decode empty array", () => {
      expect(decodeStaticField("int8", new Uint8Array(0), 0)).toEqual(0);
    });
  });

  describe("int48", () => {
    it("should decode type(int48).max", () => {
      expect(decodeStaticField("int48", hexToArray("0x7fffffffffff"), 0)).toEqual(140737488355327);
    });
    it("should decode type(int48).min", () => {
      expect(decodeStaticField("int48", hexToArray("0x800000000000"), 0)).toEqual(-140737488355328);
    });
  });

  describe("int256", () => {
    const bytes = hexToArray("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd8f0");
    it("should decode with no offset", () => {
      expect(decodeStaticField("int256", bytes, 0)).toEqual(-10000n);
    });
  });

  describe("bytes2", () => {
    const bytes = hexToArray("0x0123456789abcdef");
    it("should decode with no offset", () => {
      expect(decodeStaticField("bytes2", bytes, 0)).toEqual("0x0123");
    });
    it("should decode with offset", () => {
      expect(decodeStaticField("bytes2", bytes, 2)).toEqual("0x4567");
    });
    it("should decode empty array", () => {
      expect(decodeStaticField("bytes2", new Uint8Array(0), 2)).toEqual("0x0000");
    });
  });
});
