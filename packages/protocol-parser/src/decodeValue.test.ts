import { describe, expect, it } from "vitest";
import { decodeValue } from "./decodeValue";

describe("decodeValue", () => {
  it("can decode bool", () => {
    expect(decodeValue("bool", "0x00")).toBe(false);
    expect(decodeValue("bool", "0x01")).toBe(true);

    // TODO: these feel like edge cases and trimming padding may get tricky with other types, decide if we shouldn't allow for parsing these values
    expect(decodeValue("bool", "0x0")).toBe(false);
    expect(decodeValue("bool", "0x1")).toBe(true);
    expect(decodeValue("bool", "0x000")).toBe(false);
    expect(decodeValue("bool", "0x001")).toBe(true);
    expect(decodeValue("bool", "0x0000")).toBe(false);
    expect(decodeValue("bool", "0x0001")).toBe(true);
  });

  it("can decode uint8", () => {
    expect(decodeValue("uint8", "0x00")).toBe(0);
    expect(decodeValue("uint8", "0x01")).toBe(1);
    expect(decodeValue("uint8", "0xff")).toBe(255);
  });

  it("can decode uint256", () => {
    expect(decodeValue("uint256", "0x0000000000000000000000000000000000000000000000000000000000000000")).toBe(0n);
    expect(decodeValue("uint256", "0x0000000000000000000000000000000000000000000000000000000000000001")).toBe(1n);
    expect(decodeValue("uint256", "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")).toBe(
      115792089237316195423570985008687907853269984665640564039457584007913129639935n
    );
    expect(decodeValue("uint256", "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe")).toBe(
      115792089237316195423570985008687907853269984665640564039457584007913129639934n
    );
  });

  it("can decode int", () => {
    expect(decodeValue("int8", "0x00")).toBe(0);
    expect(decodeValue("int8", "0x01")).toBe(1);
    expect(decodeValue("int8", "0x7f")).toBe(127);
    expect(decodeValue("int8", "0x80")).toBe(-128);
    expect(decodeValue("int8", "0x81")).toBe(-127);
    expect(decodeValue("int8", "0xff")).toBe(-1);
  });

  it("can decode int256", () => {
    expect(decodeValue("int256", "0x0000000000000000000000000000000000000000000000000000000000000000")).toBe(0n);
    expect(decodeValue("int256", "0x0000000000000000000000000000000000000000000000000000000000000001")).toBe(1n);
    expect(decodeValue("int256", "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")).toBe(
      57896044618658097711785492504343953926634992332820282019728792003956564819967n
    );
    expect(decodeValue("int256", "0x8000000000000000000000000000000000000000000000000000000000000000")).toBe(
      -57896044618658097711785492504343953926634992332820282019728792003956564819968n
    );
    expect(decodeValue("int256", "0x8000000000000000000000000000000000000000000000000000000000000001")).toBe(
      -57896044618658097711785492504343953926634992332820282019728792003956564819967n
    );
    expect(decodeValue("int256", "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")).toBe(-1n);
  });

  it("can decode bytes", () => {
    expect(decodeValue("bytes1", "0x01")).toBe("0x01");
    expect(decodeValue("bytes2", "0x0001")).toBe("0x0001");
    expect(decodeValue("bytes8", "0xff00ff00ff00ff00")).toBe("0xff00ff00ff00ff00");
    expect(decodeValue("bytes32", "0x00000000000000000000000000000000000000000000000000000000000000001")).toBe(
      "0x00000000000000000000000000000000000000000000000000000000000000001"
    );
    expect(decodeValue("bytes", "0x00000000000000000000000000000000000000000000000000000000000000001")).toBe(
      "0x00000000000000000000000000000000000000000000000000000000000000001"
    );
  });

  it("can decode string", () => {
    expect(decodeValue("string", "0x68656c6c6f000000000000000000000000000000000000000000000000000000")).toBe("hello");
    expect(decodeValue("string", "0x68656c6c6f")).toBe("hello");
  });

  it("can decode address", () => {
    expect(decodeValue("address", "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")).toBe(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );
    expect(decodeValue("address", "0xffffffffffffffffffffffffffffffffffffffff")).toBe(
      "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF"
    );

    expect(() => decodeValue("address", "0x00")).toThrow('Address "0x00" is invalid.');
    expect(() => decodeValue("address", "0xffffffffffffffffffffffffffffffffffffffffff")).toThrow(
      'Address "0xffffffffffffffffffffffffffffffffffffffffff" is invalid.'
    );
  });
});
