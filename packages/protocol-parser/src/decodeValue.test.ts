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
});
