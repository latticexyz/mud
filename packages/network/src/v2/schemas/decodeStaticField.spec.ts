import { SchemaType } from "@latticexyz/schema-type";
import { hexToArray } from "@latticexyz/utils";
import { decodeStaticField } from "./decodeStaticField";

describe("decodeStaticField", () => {
  describe("SchemaType.BOOL", () => {
    it("should decode with no offset", () => {
      expect(decodeStaticField(SchemaType.BOOL, new Uint8Array([0]), 0)).toEqual(false);
      expect(decodeStaticField(SchemaType.BOOL, new Uint8Array([1]), 0)).toEqual(true);
    });
    it("should decode with offset", () => {
      expect(decodeStaticField(SchemaType.BOOL, new Uint8Array([0, 0]), 1)).toEqual(false);
      expect(decodeStaticField(SchemaType.BOOL, new Uint8Array([0, 1]), 1)).toEqual(true);
    });
    it("should decode slice", () => {
      const buffer = new Uint8Array([0, 1, 2, 3]).buffer;
      expect(decodeStaticField(SchemaType.BOOL, new Uint8Array(buffer, 0, 1), 0)).toEqual(false);
      expect(decodeStaticField(SchemaType.BOOL, new Uint8Array(buffer, 1, 1), 0)).toEqual(true);
    });
  });

  describe("SchemaType.UINT256", () => {
    const bytes = hexToArray("0x00000000000000000000000000000000000000000000000000000000008e216c");
    it("should decode with no offset", () => {
      expect(decodeStaticField(SchemaType.UINT256, bytes, 0)).toEqual(9314668n);
    });
  });

  describe("SchemaType.INT8", () => {
    it("should decode type(int8).max", () => {
      expect(decodeStaticField(SchemaType.INT8, hexToArray("0x7f"), 0)).toEqual(127);
    });
    it("should decode type(int8).min", () => {
      expect(decodeStaticField(SchemaType.INT8, hexToArray("0x80"), 0)).toEqual(-128);
    });
  });

  describe("SchemaType.INT48", () => {
    it("should decode type(int48).max", () => {
      expect(decodeStaticField(SchemaType.INT48, hexToArray("0x7fffffffffff"), 0)).toEqual(140737488355327);
    });
    it("should decode type(int48).min", () => {
      expect(decodeStaticField(SchemaType.INT48, hexToArray("0x800000000000"), 0)).toEqual(-140737488355328);
    });
  });

  describe("SchemaType.INT256", () => {
    const bytes = hexToArray("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd8f0");
    it("should decode with no offset", () => {
      expect(decodeStaticField(SchemaType.INT256, bytes, 0)).toEqual(-10000n);
    });
  });

  describe("SchemaType.BYTES2", () => {
    const bytes = hexToArray("0x0123456789abcdef");
    it("should decode with no offset", () => {
      expect(decodeStaticField(SchemaType.BYTES2, bytes, 0)).toEqual("0x0123");
    });
    it("should decode with offset", () => {
      expect(decodeStaticField(SchemaType.BYTES2, bytes, 2)).toEqual("0x4567");
    });
  });
});
