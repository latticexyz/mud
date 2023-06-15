import { describe, expect, it } from "vitest";
import { decodeDynamicField } from "./decodeDynamicField";

describe("decodeDynamicField", () => {
  it("can decode bool[]", () => {
    expect(decodeDynamicField("bool[]", "0x00")).toStrictEqual([false]);
    expect(decodeDynamicField("bool[]", "0x01")).toStrictEqual([true]);
    expect(decodeDynamicField("bool[]", "0x0000")).toStrictEqual([false, false]);
    expect(decodeDynamicField("bool[]", "0x0001")).toStrictEqual([false, true]);
    expect(decodeDynamicField("bool[]", "0x0100")).toStrictEqual([true, false]);
    expect(decodeDynamicField("bool[]", "0x0101")).toStrictEqual([true, true]);
  });

  it("can decode uint8[]", () => {
    expect(decodeDynamicField("uint8[]", "0x00")).toStrictEqual([0]);
    expect(decodeDynamicField("uint8[]", "0x01")).toStrictEqual([1]);
    expect(decodeDynamicField("uint8[]", "0xff")).toStrictEqual([255]);
    expect(decodeDynamicField("uint8[]", "0x0000")).toStrictEqual([0, 0]);
    expect(decodeDynamicField("uint8[]", "0x0101")).toStrictEqual([1, 1]);
    expect(decodeDynamicField("uint8[]", "0xffff")).toStrictEqual([255, 255]);
  });

  it("can decode uint256[]", () => {
    expect(
      decodeDynamicField("uint256[]", "0x0000000000000000000000000000000000000000000000000000000000000000")
    ).toStrictEqual([0n]);
    expect(
      decodeDynamicField("uint256[]", "0x0000000000000000000000000000000000000000000000000000000000000001")
    ).toStrictEqual([1n]);
    expect(
      decodeDynamicField("uint256[]", "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    ).toStrictEqual([115792089237316195423570985008687907853269984665640564039457584007913129639935n]);
    expect(
      decodeDynamicField("uint256[]", "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe")
    ).toStrictEqual([115792089237316195423570985008687907853269984665640564039457584007913129639934n]);
    expect(
      decodeDynamicField(
        "uint256[]",
        "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001"
      )
    ).toStrictEqual([1n, 1n]);
    expect(
      decodeDynamicField(
        "uint256[]",
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      )
    ).toStrictEqual([
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
    ]);
  });

  it("can decode int8[]", () => {
    expect(decodeDynamicField("int8[]", "0x00")).toStrictEqual([0]);
    expect(decodeDynamicField("int8[]", "0x01")).toStrictEqual([1]);
    expect(decodeDynamicField("int8[]", "0x7f")).toStrictEqual([127]);
    expect(decodeDynamicField("int8[]", "0x80")).toStrictEqual([-128]);
    expect(decodeDynamicField("int8[]", "0x81")).toStrictEqual([-127]);
    expect(decodeDynamicField("int8[]", "0xff")).toStrictEqual([-1]);

    expect(decodeDynamicField("int8[]", "0x0000")).toStrictEqual([0, 0]);
    expect(decodeDynamicField("int8[]", "0x0100")).toStrictEqual([1, 0]);
    expect(decodeDynamicField("int8[]", "0x007f")).toStrictEqual([0, 127]);
    expect(decodeDynamicField("int8[]", "0x8080")).toStrictEqual([-128, -128]);
    expect(decodeDynamicField("int8[]", "0x8181")).toStrictEqual([-127, -127]);
    expect(decodeDynamicField("int8[]", "0x00ff")).toStrictEqual([0, -1]);
  });

  it("can decode int256[]", () => {
    expect(
      decodeDynamicField("int256[]", "0x0000000000000000000000000000000000000000000000000000000000000000")
    ).toStrictEqual([0n]);
    expect(
      decodeDynamicField("int256[]", "0x0000000000000000000000000000000000000000000000000000000000000001")
    ).toStrictEqual([1n]);
    expect(
      decodeDynamicField("int256[]", "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    ).toStrictEqual([57896044618658097711785492504343953926634992332820282019728792003956564819967n]);
    expect(
      decodeDynamicField("int256[]", "0x8000000000000000000000000000000000000000000000000000000000000000")
    ).toStrictEqual([-57896044618658097711785492504343953926634992332820282019728792003956564819968n]);
    expect(
      decodeDynamicField("int256[]", "0x8000000000000000000000000000000000000000000000000000000000000001")
    ).toStrictEqual([-57896044618658097711785492504343953926634992332820282019728792003956564819967n]);
    expect(
      decodeDynamicField("int256[]", "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    ).toStrictEqual([-1n]);

    expect(
      decodeDynamicField(
        "int256[]",
        "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      )
    ).toStrictEqual([57896044618658097711785492504343953926634992332820282019728792003956564819967n, -1n]);
    expect(
      decodeDynamicField(
        "int256[]",
        "0x80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
      )
    ).toStrictEqual([-57896044618658097711785492504343953926634992332820282019728792003956564819968n, 0n]);
    expect(
      decodeDynamicField(
        "int256[]",
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8000000000000000000000000000000000000000000000000000000000000001"
      )
    ).toStrictEqual([-1n, -57896044618658097711785492504343953926634992332820282019728792003956564819967n]);
  });

  it("can decode bytes arrays", () => {
    expect(decodeDynamicField("bytes1[]", "0x01")).toStrictEqual(["0x01"]);
    expect(decodeDynamicField("bytes1[]", "0x0001")).toStrictEqual(["0x00", "0x01"]);
    expect(decodeDynamicField("bytes2[]", "0x0001")).toStrictEqual(["0x0001"]);
    expect(decodeDynamicField("bytes8[]", "0xff00ff00ff00ff00")).toStrictEqual(["0xff00ff00ff00ff00"]);
    expect(decodeDynamicField("bytes1[]", "0xff00ff00ff00ff00")).toStrictEqual([
      "0xff",
      "0x00",
      "0xff",
      "0x00",
      "0xff",
      "0x00",
      "0xff",
      "0x00",
    ]);
    expect(decodeDynamicField("bytes2[]", "0xff00ff00ff00ff00")).toStrictEqual([
      "0xff00",
      "0xff00",
      "0xff00",
      "0xff00",
    ]);
    expect(decodeDynamicField("bytes4[]", "0xff00ff00ff00ff00")).toStrictEqual(["0xff00ff00", "0xff00ff00"]);
    expect(
      decodeDynamicField("bytes32[]", "0x0000000000000000000000000000000000000000000000000000000000000001")
    ).toStrictEqual(["0x0000000000000000000000000000000000000000000000000000000000000001"]);
    expect(
      decodeDynamicField(
        "bytes32[]",
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001"
      )
    ).toStrictEqual([
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    ]);
  });

  it("can decode address[]", () => {
    expect(decodeDynamicField("address[]", "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")).toStrictEqual([
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    ]);
    expect(decodeDynamicField("address[]", "0xffffffffffffffffffffffffffffffffffffffff")).toStrictEqual([
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
