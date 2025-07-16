import { describe, expect, it } from "vitest";
import { getLeftPaddingBits, isLeftAligned, renderTableId, renderValueTypeToBytes32 } from "./common";

describe("isLeftAligned", () => {
  it("returns true when a Solidity type's bytes should be left aligned", () => {
    expect(isLeftAligned({ internalTypeId: "bytes32" })).toBe(true);
    expect(isLeftAligned({ internalTypeId: "uint256" })).toBe(false);
    expect(isLeftAligned({ internalTypeId: "bool" })).toBe(false);
  });
});

describe("getLeftPaddingBits", () => {
  it("returns number of bits to left pad the bytes representation", () => {
    expect(getLeftPaddingBits({ internalTypeId: "bytes32", staticByteLength: 32 })).toBe(0);
    expect(getLeftPaddingBits({ internalTypeId: "bytes16", staticByteLength: 16 })).toBe(0);
    expect(getLeftPaddingBits({ internalTypeId: "uint32", staticByteLength: 4 })).toBe(224);
    expect(getLeftPaddingBits({ internalTypeId: "uint64", staticByteLength: 8 })).toBe(192);
    expect(getLeftPaddingBits({ internalTypeId: "uint128", staticByteLength: 16 })).toBe(128);
  });
});

describe("renderValueTypeToBytes32", () => {
  it("returns Solidity code to cast native type to bytes32", () => {
    expect(renderValueTypeToBytes32("someField", { typeUnwrap: "", internalTypeId: "bytes32" })).toMatchInlineSnapshot(
      '"someField"',
    );
    expect(
      renderValueTypeToBytes32("someField", { typeUnwrap: "SomeStruct.unwrap", internalTypeId: "bytes32" }),
    ).toMatchInlineSnapshot('"SomeStruct.unwrap(someField)"');

    expect(renderValueTypeToBytes32("someField", { typeUnwrap: "", internalTypeId: "bytes16" })).toMatchInlineSnapshot(
      '"bytes32(someField)"',
    );
    expect(
      renderValueTypeToBytes32("someField", { typeUnwrap: "SomeStruct.unwrap", internalTypeId: "bytes16" }),
    ).toMatchInlineSnapshot('"bytes32(SomeStruct.unwrap(someField))"');

    expect(renderValueTypeToBytes32("someField", { typeUnwrap: "", internalTypeId: "uint8" })).toMatchInlineSnapshot(
      '"bytes32(uint256(someField))"',
    );
    expect(
      renderValueTypeToBytes32("someField", { typeUnwrap: "SomeStruct.unwrap", internalTypeId: "uint8" }),
    ).toMatchInlineSnapshot('"bytes32(uint256(SomeStruct.unwrap(someField)))"');

    expect(renderValueTypeToBytes32("someField", { typeUnwrap: "", internalTypeId: "bool" })).toMatchInlineSnapshot(
      '"_boolToBytes32(someField)"',
    );
    expect(
      renderValueTypeToBytes32("someField", { typeUnwrap: "SomeStruct.unwrap", internalTypeId: "bool" }),
    ).toMatchInlineSnapshot('"_boolToBytes32(SomeStruct.unwrap(someField))"');

    expect(renderValueTypeToBytes32("someField", { typeUnwrap: "", internalTypeId: "address" })).toMatchInlineSnapshot(
      '"bytes32(uint256(uint160(someField)))"',
    );
    expect(
      renderValueTypeToBytes32("someField", { typeUnwrap: "SomeStruct.unwrap", internalTypeId: "address" }),
    ).toMatchInlineSnapshot('"bytes32(uint256(uint160(SomeStruct.unwrap(someField))))"');
  });
});

describe("renderTableId", () => {
  it("returns Solidity code to compute table ID", () => {
    expect(renderTableId({ namespace: "somewhere", name: "Player", offchainOnly: false })).toMatchInlineSnapshot(`
      "
          // Hex below is the result of \`WorldResourceIdLib.encode({ namespace: "somewhere", name: "Player", typeId: RESOURCE_TABLE });\`
          ResourceId constant _tableId = ResourceId.wrap(0x7462736f6d6577686572650000000000506c6179657200000000000000000000);
        "
    `);
  });

  it("returns Solidity code to compute offchain table ID", () => {
    expect(renderTableId({ namespace: "somewhere", name: "Player", offchainOnly: true })).toMatchInlineSnapshot(`
      "
          // Hex below is the result of \`WorldResourceIdLib.encode({ namespace: "somewhere", name: "Player", typeId: RESOURCE_OFFCHAIN_TABLE });\`
          ResourceId constant _tableId = ResourceId.wrap(0x6f74736f6d6577686572650000000000506c6179657200000000000000000000);
        "
    `);
  });
});
