// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Schema, SchemaLib } from "../src/Schema.sol";

/**
 * Overrides for encode function to simplify tests
 */
library SchemaEncodeHelper {
  function encode(uint256 a, uint256 numDynamicFields) internal pure returns (Schema) {
    uint256[] memory schema = new uint256[](1);
    schema[0] = a;
    return SchemaLib.encode(schema, numDynamicFields);
  }

  function encode(uint256 a, uint256 b, uint256 numDynamicFields) internal pure returns (Schema) {
    uint256[] memory schema = new uint256[](2);
    schema[0] = a;
    schema[1] = b;
    return SchemaLib.encode(schema, numDynamicFields);
  }

  function encode(uint256 a, uint256 b, uint256 c, uint256 numDynamicFields) internal pure returns (Schema) {
    uint256[] memory schema = new uint256[](3);
    schema[0] = a;
    schema[1] = b;
    schema[2] = c;
    return SchemaLib.encode(schema, numDynamicFields);
  }

  function encode(uint256 a, uint256 b, uint256 c, uint256 d, uint256 numDynamicFields) internal pure returns (Schema) {
    uint256[] memory schema = new uint256[](4);
    schema[0] = a;
    schema[1] = b;
    schema[2] = c;
    schema[3] = d;
    return SchemaLib.encode(schema, numDynamicFields);
  }

  function encode(
    uint256 a,
    uint256 b,
    uint256 c,
    uint256 d,
    uint256 e,
    uint256 numDynamicFields
  ) internal pure returns (Schema) {
    uint256[] memory schema = new uint256[](5);
    schema[0] = a;
    schema[1] = b;
    schema[2] = c;
    schema[3] = d;
    schema[4] = e;
    return SchemaLib.encode(schema, numDynamicFields);
  }

  function encode(
    uint256 a,
    uint256 b,
    uint256 c,
    uint256 d,
    uint256 e,
    uint256 f,
    uint256 numDynamicFields
  ) internal pure returns (Schema) {
    uint256[] memory schema = new uint256[](6);
    schema[0] = a;
    schema[1] = b;
    schema[2] = c;
    schema[3] = d;
    schema[4] = e;
    schema[5] = f;
    return SchemaLib.encode(schema, numDynamicFields);
  }
}
