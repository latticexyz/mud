import { describe, expect, it } from "vitest";
import { renderFieldLayout } from "./renderFieldLayout";
import { RenderType } from "@latticexyz/common/codegen";

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
    ] as RenderType[];

    expect(renderFieldLayout(fields)).toEqual(
      `FieldLayout constant _fieldLayout = FieldLayout.wrap(0x013418040102030405060708090a0b0c0d0e0f10111213141516172000000000);`
    );
  });
});
