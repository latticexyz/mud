import { describe, expectTypeOf, it } from "vitest";
import { StaticAbiTypeToPrimitiveType } from "./staticAbiTypes";
import { Hex } from "viem";

describe("StaticAbiTypeToPrimitiveType", () => {
  it("maps uint8 to number", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"uint8">>().toBeNumber();
  });
  it("maps uint32 to number", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"uint32">>().toBeNumber();
  });
  it("maps uint48 to number", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"uint48">>().toBeNumber();
  });
  it("maps uint56 to number", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"uint56">>().toMatchTypeOf<bigint>();
  });
  it("maps uint256 to number", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"uint256">>().toMatchTypeOf<bigint>();
  });

  it("maps int8 to number", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"int8">>().toBeNumber();
  });
  it("maps int32 to number", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"int32">>().toBeNumber();
  });
  it("maps int48 to number", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"int48">>().toBeNumber();
  });
  it("maps int56 to number", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"int56">>().toMatchTypeOf<bigint>();
  });
  it("maps int256 to number", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"int256">>().toMatchTypeOf<bigint>();
  });

  it("maps bytes1 to hex", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"bytes1">>().toMatchTypeOf<Hex>();
  });
  it("maps bytes2 to hex", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"bytes2">>().toMatchTypeOf<Hex>();
  });
  it("maps bytes8 to hex", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"bytes8">>().toMatchTypeOf<Hex>();
  });
  it("maps bytes32 to hex", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"bytes32">>().toMatchTypeOf<Hex>();
  });

  it("maps bool to boolean", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"bool">>().toBeBoolean();
  });

  it("maps address to hex", () => {
    expectTypeOf<StaticAbiTypeToPrimitiveType<"address">>().toMatchTypeOf<Hex>();
  });
});
