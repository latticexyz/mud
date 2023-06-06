import { describe, expect, it } from "vitest";
import { decodeDynamicField } from "./decodeDynamicField";

describe("decodeDynamicField", () => {
  it("can decode bool[]", () => {
    expect(decodeDynamicField("bool[]", "0x00")).toEqual([false]);
    expect(decodeDynamicField("bool[]", "0x01")).toEqual([true]);
    expect(decodeDynamicField("bool[]", "0x0000")).toEqual([false, false]);
    expect(decodeDynamicField("bool[]", "0x0001")).toEqual([false, true]);
    expect(decodeDynamicField("bool[]", "0x0100")).toEqual([true, false]);
    expect(decodeDynamicField("bool[]", "0x0101")).toEqual([true, true]);
  });

  it("can decode uint8[]", () => {
    expect(decodeDynamicField("uint8[]", "0x00")).toEqual([0]);
    expect(decodeDynamicField("uint8[]", "0x01")).toEqual([1]);
    expect(decodeDynamicField("uint8[]", "0xff")).toEqual([255]);
    expect(decodeDynamicField("uint8[]", "0x0000")).toEqual([0, 0]);
    expect(decodeDynamicField("uint8[]", "0x0101")).toEqual([1, 1]);
    expect(decodeDynamicField("uint8[]", "0xffff")).toEqual([255, 255]);
  });

  it("can decode uint256[]", () => {
    expect(
      decodeDynamicField("uint256[]", "0x0000000000000000000000000000000000000000000000000000000000000000")
    ).toEqual([0n]);
    expect(
      decodeDynamicField("uint256[]", "0x0000000000000000000000000000000000000000000000000000000000000001")
    ).toEqual([1n]);
    expect(
      decodeDynamicField("uint256[]", "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    ).toEqual([115792089237316195423570985008687907853269984665640564039457584007913129639935n]);
    expect(
      decodeDynamicField("uint256[]", "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe")
    ).toEqual([115792089237316195423570985008687907853269984665640564039457584007913129639934n]);
    expect(
      decodeDynamicField(
        "uint256[]",
        "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001"
      )
    ).toEqual([1n, 1n]);
    expect(
      decodeDynamicField(
        "uint256[]",
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      )
    ).toEqual([
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
    ]);
  });

  it("can decode int8[]", () => {
    expect(decodeDynamicField("int8[]", "0x00")).toEqual([0]);
    expect(decodeDynamicField("int8[]", "0x01")).toEqual([1]);
    expect(decodeDynamicField("int8[]", "0x7f")).toEqual([127]);
    expect(decodeDynamicField("int8[]", "0x80")).toEqual([-128]);
    expect(decodeDynamicField("int8[]", "0x81")).toEqual([-127]);
    expect(decodeDynamicField("int8[]", "0xff")).toEqual([-1]);

    expect(decodeDynamicField("int8[]", "0x0000")).toEqual([0, 0]);
    expect(decodeDynamicField("int8[]", "0x0100")).toEqual([1, 0]);
    expect(decodeDynamicField("int8[]", "0x007f")).toEqual([0, 127]);
    expect(decodeDynamicField("int8[]", "0x8080")).toEqual([-128, -128]);
    expect(decodeDynamicField("int8[]", "0x8181")).toEqual([-127, -127]);
    expect(decodeDynamicField("int8[]", "0x00ff")).toEqual([0, -1]);
  });

  it("can decode int256[]", () => {
    expect(
      decodeDynamicField("int256[]", "0x0000000000000000000000000000000000000000000000000000000000000000")
    ).toEqual([0n]);
    expect(
      decodeDynamicField("int256[]", "0x0000000000000000000000000000000000000000000000000000000000000001")
    ).toEqual([1n]);
    expect(
      decodeDynamicField("int256[]", "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    ).toEqual([57896044618658097711785492504343953926634992332820282019728792003956564819967n]);
    expect(
      decodeDynamicField("int256[]", "0x8000000000000000000000000000000000000000000000000000000000000000")
    ).toEqual([-57896044618658097711785492504343953926634992332820282019728792003956564819968n]);
    expect(
      decodeDynamicField("int256[]", "0x8000000000000000000000000000000000000000000000000000000000000001")
    ).toEqual([-57896044618658097711785492504343953926634992332820282019728792003956564819967n]);
    expect(
      decodeDynamicField("int256[]", "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    ).toEqual([-1n]);

    expect(
      decodeDynamicField(
        "int256[]",
        "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      )
    ).toEqual([57896044618658097711785492504343953926634992332820282019728792003956564819967n, -1n]);
    expect(
      decodeDynamicField(
        "int256[]",
        "0x80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
      )
    ).toEqual([-57896044618658097711785492504343953926634992332820282019728792003956564819968n, 0n]);
    expect(
      decodeDynamicField(
        "int256[]",
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8000000000000000000000000000000000000000000000000000000000000001"
      )
    ).toEqual([-1n, -57896044618658097711785492504343953926634992332820282019728792003956564819967n]);
  });

  it("can decode bytes arrays", () => {
    expect(decodeDynamicField("bytes1[]", "0x01")).toEqual(["0x01"]);
    expect(decodeDynamicField("bytes1[]", "0x0001")).toEqual(["0x00", "0x01"]);
    expect(decodeDynamicField("bytes2[]", "0x0001")).toEqual(["0x0001"]);
    expect(decodeDynamicField("bytes8[]", "0xff00ff00ff00ff00")).toEqual(["0xff00ff00ff00ff00"]);
    expect(decodeDynamicField("bytes1[]", "0xff00ff00ff00ff00")).toEqual([
      "0xff",
      "0x00",
      "0xff",
      "0x00",
      "0xff",
      "0x00",
      "0xff",
      "0x00",
    ]);
    expect(decodeDynamicField("bytes2[]", "0xff00ff00ff00ff00")).toEqual(["0xff00", "0xff00", "0xff00", "0xff00"]);
    expect(decodeDynamicField("bytes4[]", "0xff00ff00ff00ff00")).toEqual(["0xff00ff00", "0xff00ff00"]);
    expect(
      decodeDynamicField("bytes32[]", "0x0000000000000000000000000000000000000000000000000000000000000001")
    ).toEqual(["0x0000000000000000000000000000000000000000000000000000000000000001"]);
    expect(
      decodeDynamicField(
        "bytes32[]",
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001"
      )
    ).toEqual([
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    ]);
  });

  it("can decode address[]", () => {
    expect(decodeDynamicField("address[]", "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")).toEqual([
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    ]);
    expect(decodeDynamicField("address[]", "0xffffffffffffffffffffffffffffffffffffffff")).toEqual([
      "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF",
    ]);

    expect(() => decodeDynamicField("address[]", "0x00")).toThrow(
      'Hex value "0x00" has length of 2, but expected a multiple of 40 for address[] type.'
    );
    expect(() => decodeDynamicField("address[]", "0xffffffffffffffffffffffffffffffffffffffffff")).toThrow(
      'Hex value "0xffffffffffffffffffffffffffffffffffffffffff" has length of 42, but expected a multiple of 40 for address[] type.'
    );
  });

  it("can decode bytes", () => {
    expect(decodeDynamicField("bytes", "0x")).toBe("0x");
    expect(decodeDynamicField("bytes", "0x01")).toBe("0x01");
    expect(decodeDynamicField("bytes", "0x0001")).toBe("0x0001");
    expect(decodeDynamicField("bytes", "0xff00ff00ff00ff00")).toBe("0xff00ff00ff00ff00");
    expect(decodeDynamicField("bytes", "0x0000000000000000000000000000000000000000000000000000000000000001")).toBe(
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    );
  });

  it("can decode string", () => {
    expect(decodeDynamicField("string", "0x")).toBe("");
    expect(decodeDynamicField("string", "0x68656c6c6f")).toBe("hello");
  });
});
