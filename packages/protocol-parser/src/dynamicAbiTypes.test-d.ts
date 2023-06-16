import { describe, expectTypeOf, it } from "vitest";
import { DynamicAbiTypeToPrimitiveType } from "./dynamicAbiTypes";
import { Hex } from "viem";

describe("DynamicAbiTypeToPrimitiveType", () => {
  it("maps uint8 array to number array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"uint8[]">>().toMatchTypeOf<number[]>();
  });
  it("maps uint32 array to number array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"uint32[]">>().toMatchTypeOf<number[]>();
  });
  it("maps uint48 array to number array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"uint48[]">>().toMatchTypeOf<number[]>();
  });
  it("maps uint56 array to bigint array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"uint56[]">>().toMatchTypeOf<bigint[]>();
  });
  it("maps uint256 array to bigint array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"uint256[]">>().toMatchTypeOf<bigint[]>();
  });

  it("maps int8 array to number array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"int8[]">>().toMatchTypeOf<number[]>();
  });
  it("maps int32 array to number array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"int32[]">>().toMatchTypeOf<number[]>();
  });
  it("maps int48 array to number array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"int48[]">>().toMatchTypeOf<number[]>();
  });
  it("maps int56 array to bigint array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"int56[]">>().toMatchTypeOf<bigint[]>();
  });
  it("maps int256 array to bigint array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"int256[]">>().toMatchTypeOf<bigint[]>();
  });

  it("maps bytes1 array to hex array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"bytes1[]">>().toMatchTypeOf<Hex[]>();
  });
  it("maps bytes2 array to hex array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"bytes2[]">>().toMatchTypeOf<Hex[]>();
  });
  it("maps bytes8 array to hex array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"bytes8[]">>().toMatchTypeOf<Hex[]>();
  });
  it("maps bytes32 array to hex array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"bytes32[]">>().toMatchTypeOf<Hex[]>();
  });

  it("maps bool array to boolean array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"bool[]">>().toMatchTypeOf<boolean[]>();
  });

  it("maps address array to hex array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"address[]">>().toMatchTypeOf<Hex[]>();
  });

  it("maps bytes to hex", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"bytes">>().toMatchTypeOf<Hex>();
  });

  it("maps string to string", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"string">>().toMatchTypeOf<string>();
  });
});
