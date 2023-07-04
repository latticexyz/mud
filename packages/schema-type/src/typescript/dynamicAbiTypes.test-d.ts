import { describe, expectTypeOf, it } from "vitest";
import { Hex } from "viem";
import { DynamicAbiTypeToPrimitiveType } from "./dynamicAbiTypes";

describe("DynamicAbiTypeToPrimitiveType", () => {
  it("maps uint8 array to number array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"uint8[]">>().toMatchTypeOf<readonly number[]>();
  });
  it("maps uint32 array to number array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"uint32[]">>().toMatchTypeOf<readonly number[]>();
  });
  it("maps uint48 array to number array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"uint48[]">>().toMatchTypeOf<readonly number[]>();
  });
  it("maps uint56 array to bigint array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"uint56[]">>().toMatchTypeOf<readonly bigint[]>();
  });
  it("maps uint256 array to bigint array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"uint256[]">>().toMatchTypeOf<readonly bigint[]>();
  });

  it("maps int8 array to number array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"int8[]">>().toMatchTypeOf<readonly number[]>();
  });
  it("maps int32 array to number array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"int32[]">>().toMatchTypeOf<readonly number[]>();
  });
  it("maps int48 array to number array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"int48[]">>().toMatchTypeOf<readonly number[]>();
  });
  it("maps int56 array to bigint array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"int56[]">>().toMatchTypeOf<readonly bigint[]>();
  });
  it("maps int256 array to bigint array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"int256[]">>().toMatchTypeOf<readonly bigint[]>();
  });

  it("maps bytes1 array to hex array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"bytes1[]">>().toMatchTypeOf<readonly Hex[]>();
  });
  it("maps bytes2 array to hex array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"bytes2[]">>().toMatchTypeOf<readonly Hex[]>();
  });
  it("maps bytes8 array to hex array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"bytes8[]">>().toMatchTypeOf<readonly Hex[]>();
  });
  it("maps bytes32 array to hex array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"bytes32[]">>().toMatchTypeOf<readonly Hex[]>();
  });

  it("maps bool array to boolean array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"bool[]">>().toMatchTypeOf<readonly boolean[]>();
  });

  it("maps address array to hex array", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"address[]">>().toMatchTypeOf<readonly Hex[]>();
  });

  it("maps bytes to hex", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"bytes">>().toMatchTypeOf<Hex>();
  });

  it("maps string to string", () => {
    expectTypeOf<DynamicAbiTypeToPrimitiveType<"string">>().toMatchTypeOf<string>();
  });
});
