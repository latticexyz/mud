import { describe, expect, it } from "vitest";
import { decodeStaticField } from "./decodeStaticField";

describe("decodeStaticField", () => {
  it("can decode bool", () => {
    expect(decodeStaticField("bool", "0x00")).toBe(false);
    expect(decodeStaticField("bool", "0x01")).toBe(true);

    expect(() => decodeStaticField("bool", "0x0")).toThrow(
      'Hex value "0x0" has length of 1, but expected length of 2 for bool type.'
    );
    expect(() => decodeStaticField("bool", "0x1")).toThrow(
      'Hex value "0x1" has length of 1, but expected length of 2 for bool type.'
    );
    expect(() => decodeStaticField("bool", "0x000")).toThrow(
      'Hex value "0x000" is an odd length (3). It must be an even length.'
    );
    expect(() => decodeStaticField("bool", "0x001")).toThrow(
      'Hex value "0x001" is an odd length (3). It must be an even length.'
    );
    expect(() => decodeStaticField("bool", "0x0000")).toThrow(
      'Hex value "0x0000" has length of 4, but expected length of 2 for bool type.'
    );
    expect(() => decodeStaticField("bool", "0x0001")).toThrow(
      'Hex value "0x0001" has length of 4, but expected length of 2 for bool type.'
    );
  });

  it("can decode uint8", () => {
    expect(decodeStaticField("uint8", "0x00")).toBe(0);
    expect(decodeStaticField("uint8", "0x01")).toBe(1);
    expect(decodeStaticField("uint8", "0xff")).toBe(255);
  });

  it("can decode uint256", () => {
    expect(decodeStaticField("uint256", "0x0000000000000000000000000000000000000000000000000000000000000000")).toBe(0n);
    expect(decodeStaticField("uint256", "0x0000000000000000000000000000000000000000000000000000000000000001")).toBe(1n);
    expect(decodeStaticField("uint256", "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")).toBe(
      115792089237316195423570985008687907853269984665640564039457584007913129639935n
    );
    expect(decodeStaticField("uint256", "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe")).toBe(
      115792089237316195423570985008687907853269984665640564039457584007913129639934n
    );
  });

  it("can decode int8", () => {
    expect(decodeStaticField("int8", "0x00")).toBe(0);
    expect(decodeStaticField("int8", "0x01")).toBe(1);
    expect(decodeStaticField("int8", "0x7f")).toBe(127);
    expect(decodeStaticField("int8", "0x80")).toBe(-128);
    expect(decodeStaticField("int8", "0x81")).toBe(-127);
    expect(decodeStaticField("int8", "0xff")).toBe(-1);
  });

  it("can decode int256", () => {
    expect(decodeStaticField("int256", "0x0000000000000000000000000000000000000000000000000000000000000000")).toBe(0n);
    expect(decodeStaticField("int256", "0x0000000000000000000000000000000000000000000000000000000000000001")).toBe(1n);
    expect(decodeStaticField("int256", "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")).toBe(
      57896044618658097711785492504343953926634992332820282019728792003956564819967n
    );
    expect(decodeStaticField("int256", "0x8000000000000000000000000000000000000000000000000000000000000000")).toBe(
      -57896044618658097711785492504343953926634992332820282019728792003956564819968n
    );
    expect(decodeStaticField("int256", "0x8000000000000000000000000000000000000000000000000000000000000001")).toBe(
      -57896044618658097711785492504343953926634992332820282019728792003956564819967n
    );
    expect(decodeStaticField("int256", "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")).toBe(-1n);
  });

  it("can decode bytes", () => {
    expect(decodeStaticField("bytes1", "0x01")).toBe("0x01");
    expect(decodeStaticField("bytes2", "0x0001")).toBe("0x0001");
    expect(decodeStaticField("bytes8", "0xff00ff00ff00ff00")).toBe("0xff00ff00ff00ff00");
    expect(decodeStaticField("bytes32", "0x0000000000000000000000000000000000000000000000000000000000000001")).toBe(
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    );
  });

  it("can decode address", () => {
    expect(decodeStaticField("address", "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")).toBe(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );
    expect(decodeStaticField("address", "0xffffffffffffffffffffffffffffffffffffffff")).toBe(
      "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF"
    );

    expect(() => decodeStaticField("address", "0x00")).toThrow(
      'Hex value "0x00" has length of 2, but expected length of 40 for address type.'
    );
    expect(() => decodeStaticField("address", "0xffffffffffffffffffffffffffffffffffffffffff")).toThrow(
      'Hex value "0xffffffffffffffffffffffffffffffffffffffffff" has length of 42, but expected length of 40 for address type.'
    );
  });
});
