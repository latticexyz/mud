// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// TODO: add remaining types
enum SchemaType {
  None, // The first `None` value ends the schema
  Uint8,
  Uint16,
  Uint32
}

/**
 * Get the length of the data for the given schema type
 * (Because Solidity doesn't support constant arrays, we need to use a function)
 * TODO: add more types and make it more efficient (avoid linear search)
 */
function getByteLength(SchemaType schemaType) pure returns (uint256) {
  if (schemaType == SchemaType.Uint8) {
    return 1;
  } else if (schemaType == SchemaType.Uint16) {
    return 2;
  } else if (schemaType == SchemaType.Uint32) {
    return 4;
  } else {
    revert("Unsupported schema type");
  }
}
