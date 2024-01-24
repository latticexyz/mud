// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test, console, stdJson } from "forge-std/Test.sol";
import "../src/constants.sol";

contract ConstantsTest is Test {
  using stdJson for string;

  function testConstants() public {
    string[] memory ffiInputs = new string[](3);
    ffiInputs[0] = "pnpm";
    ffiInputs[1] = "tsx";
    ffiInputs[2] = "ts/scripts/constants-to-json.ts";

    string memory json = string(vm.ffi(ffiInputs));
    console.log("got TS constants:", json);

    assertEq(WORD_SIZE, json.readUint("$.WORD_SIZE"));
    assertEq(WORD_LAST_INDEX, json.readUint("$.WORD_LAST_INDEX"));
    assertEq(BYTE_TO_BITS, json.readUint("$.BYTE_TO_BITS"));
    assertEq(MAX_TOTAL_FIELDS, json.readUint("$.MAX_TOTAL_FIELDS"));
    assertEq(MAX_STATIC_FIELDS, json.readUint("$.MAX_STATIC_FIELDS"));
    assertEq(MAX_DYNAMIC_FIELDS, json.readUint("$.MAX_DYNAMIC_FIELDS"));

    assertEq(LayoutOffsets.TOTAL_LENGTH, json.readUint("$.LayoutOffsets.TOTAL_LENGTH"));
    assertEq(LayoutOffsets.NUM_STATIC_FIELDS, json.readUint("$.LayoutOffsets.NUM_STATIC_FIELDS"));
    assertEq(LayoutOffsets.NUM_DYNAMIC_FIELDS, json.readUint("$.LayoutOffsets.NUM_DYNAMIC_FIELDS"));
  }
}
