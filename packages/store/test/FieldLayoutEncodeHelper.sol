// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FieldLayout, FieldLayoutLib } from "../src/FieldLayout.sol";

/**
 * Overrides for encode function to simplify tests
 */
library FieldLayoutEncodeHelper {
  function encode(uint256 a, uint256 numDynamicFields) internal pure returns (FieldLayout) {
    uint256[] memory fieldLayout = new uint256[](1);
    fieldLayout[0] = a;
    return FieldLayoutLib.encode(fieldLayout, numDynamicFields);
  }

  function encode(uint256 a, uint256 b, uint256 numDynamicFields) internal pure returns (FieldLayout) {
    uint256[] memory fieldLayout = new uint256[](2);
    fieldLayout[0] = a;
    fieldLayout[1] = b;
    return FieldLayoutLib.encode(fieldLayout, numDynamicFields);
  }

  function encode(uint256 a, uint256 b, uint256 c, uint256 numDynamicFields) internal pure returns (FieldLayout) {
    uint256[] memory fieldLayout = new uint256[](3);
    fieldLayout[0] = a;
    fieldLayout[1] = b;
    fieldLayout[2] = c;
    return FieldLayoutLib.encode(fieldLayout, numDynamicFields);
  }

  function encode(
    uint256 a,
    uint256 b,
    uint256 c,
    uint256 d,
    uint256 numDynamicFields
  ) internal pure returns (FieldLayout) {
    uint256[] memory fieldLayout = new uint256[](4);
    fieldLayout[0] = a;
    fieldLayout[1] = b;
    fieldLayout[2] = c;
    fieldLayout[3] = d;
    return FieldLayoutLib.encode(fieldLayout, numDynamicFields);
  }

  function encode(
    uint256 a,
    uint256 b,
    uint256 c,
    uint256 d,
    uint256 e,
    uint256 numDynamicFields
  ) internal pure returns (FieldLayout) {
    uint256[] memory fieldLayout = new uint256[](5);
    fieldLayout[0] = a;
    fieldLayout[1] = b;
    fieldLayout[2] = c;
    fieldLayout[3] = d;
    fieldLayout[4] = e;
    return FieldLayoutLib.encode(fieldLayout, numDynamicFields);
  }

  function encode(
    uint256 a,
    uint256 b,
    uint256 c,
    uint256 d,
    uint256 e,
    uint256 f,
    uint256 numDynamicFields
  ) internal pure returns (FieldLayout) {
    uint256[] memory fieldLayout = new uint256[](6);
    fieldLayout[0] = a;
    fieldLayout[1] = b;
    fieldLayout[2] = c;
    fieldLayout[3] = d;
    fieldLayout[4] = e;
    fieldLayout[5] = f;
    return FieldLayoutLib.encode(fieldLayout, numDynamicFields);
  }
}
