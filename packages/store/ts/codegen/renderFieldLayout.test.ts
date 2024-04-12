import { describe, expect, it } from "vitest";
import { renderFieldLayout } from "./renderFieldLayout";

describe("renderFieldLayout", () => {
  it("should match the FieldLayout.sol encoding", () => {
    const fields = [
      { isDynamic: false, staticByteLength: 1 },
      { isDynamic: false, staticByteLength: 2 },
      { isDynamic: false, staticByteLength: 3 },
      { isDynamic: false, staticByteLength: 4 },
      { isDynamic: false, staticByteLength: 5 },
      { isDynamic: false, staticByteLength: 6 },
      { isDynamic: false, staticByteLength: 7 },
      { isDynamic: false, staticByteLength: 8 },
      { isDynamic: false, staticByteLength: 9 },
      { isDynamic: false, staticByteLength: 10 },
      { isDynamic: false, staticByteLength: 11 },
      { isDynamic: false, staticByteLength: 12 },
      { isDynamic: false, staticByteLength: 13 },
      { isDynamic: false, staticByteLength: 14 },
      { isDynamic: false, staticByteLength: 15 },
      { isDynamic: false, staticByteLength: 16 },
      { isDynamic: false, staticByteLength: 17 },
      { isDynamic: false, staticByteLength: 18 },
      { isDynamic: false, staticByteLength: 19 },
      { isDynamic: false, staticByteLength: 20 },
      { isDynamic: false, staticByteLength: 21 },
      { isDynamic: false, staticByteLength: 22 },
      { isDynamic: false, staticByteLength: 23 },
      { isDynamic: false, staticByteLength: 32 },
      { isDynamic: true, staticByteLength: 0 },
      { isDynamic: true, staticByteLength: 0 },
      { isDynamic: true, staticByteLength: 0 },
      { isDynamic: true, staticByteLength: 0 },
    ];

    expect(renderFieldLayout(fields)).toMatchInlineSnapshot(
      '"FieldLayout constant _fieldLayout = FieldLayout.wrap(0x013418040102030405060708090a0b0c0d0e0f10111213141516172000000000);"',
    );

    expect(renderFieldLayout([{ isDynamic: false, staticByteLength: 2 }])).toMatchInlineSnapshot(
      '"FieldLayout constant _fieldLayout = FieldLayout.wrap(0x0002010002000000000000000000000000000000000000000000000000000000);"',
    );

    expect(renderFieldLayout([{ isDynamic: false, staticByteLength: 8 }])).toMatchInlineSnapshot(
      '"FieldLayout constant _fieldLayout = FieldLayout.wrap(0x0008010008000000000000000000000000000000000000000000000000000000);"',
    );

    expect(renderFieldLayout([{ isDynamic: false, staticByteLength: 16 }])).toMatchInlineSnapshot(
      '"FieldLayout constant _fieldLayout = FieldLayout.wrap(0x0010010010000000000000000000000000000000000000000000000000000000);"',
    );

    expect(renderFieldLayout([{ isDynamic: true, staticByteLength: 0 }])).toMatchInlineSnapshot(
      '"FieldLayout constant _fieldLayout = FieldLayout.wrap(0x0000000100000000000000000000000000000000000000000000000000000000);"',
    );
  });

  it("should fail when trying to encode too many fields", () => {
    const fields = new Array(50).fill({ isDynamic: false, staticByteLength: 2 });
    expect(() => renderFieldLayout(fields)).toThrowError("FieldLayout: too many fields");
  });

  it("should fail when trying to encode too many dynamic fields", () => {
    const fields = new Array(10).fill({ isDynamic: true, staticByteLength: 0 });
    expect(() => renderFieldLayout(fields)).toThrowError("FieldLayout: too many dynamic fields");
  });

  it("should fail when trying to encode dynamic type before static type", () => {
    const fields = [
      { isDynamic: false, staticByteLength: 2 },
      { isDynamic: true, staticByteLength: 0 },
      { isDynamic: false, staticByteLength: 2 },
    ];

    expect(() => renderFieldLayout(fields)).toThrowError("FieldLayout: static type after dynamic type");
  });
});
