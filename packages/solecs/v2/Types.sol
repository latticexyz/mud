// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// TODO: add remaining types
enum SchemaType {
  None, // The first `None` value ends the schema
  Uint8,
  Uint16,
  Uint32,
  Uint128,
  Uint256,
  Bytes4,
  Uint32Array,
  Bytes24Array,
  String,
  Address
}

/**
 * Get the length of the data for the given schema type
 * (Because Solidity doesn't support constant arrays, we need to use a function)
 * TODO: add more types and make it more efficient (avoid linear search)
 */
function getStaticByteLength(SchemaType schemaType) pure returns (uint256) {
  if (schemaType == SchemaType.Uint8) {
    return 1;
  } else if (schemaType == SchemaType.Uint16) {
    return 2;
  } else if (schemaType == SchemaType.Uint32 || schemaType == SchemaType.Bytes4) {
    return 4;
  } else if (schemaType == SchemaType.Uint128) {
    return 16;
  } else if (schemaType == SchemaType.Uint256) {
    return 32;
  } else if (schemaType == SchemaType.Address) {
    return 20;
  } else {
    // Return 0 for all dynamic types
    return 0;
  }
}

function getElementByteLength(SchemaType schemaType) pure returns (uint256) {
  if (schemaType == SchemaType.Uint32Array) {
    return 4;
  } else if (schemaType == SchemaType.Uint32Array) {
    return 1;
  } else if (schemaType == SchemaType.Bytes24Array) {
    return 24;
  } else {
    return getStaticByteLength(schemaType);
  }
}

/**
 * Returns true if the schema type has a fixed length
 * (Because Solidity doesn't support constant arrays, we need to use a function)
 * TODO: add more types and make it more efficient (avoid linear search)
 */
function hasStaticLength(SchemaType schemaType) pure returns (bool) {
  if (schemaType == SchemaType.Uint8) {
    return true;
  } else if (schemaType == SchemaType.Uint16) {
    return true;
  } else if (schemaType == SchemaType.Uint32) {
    return true;
  } else if (schemaType == SchemaType.Uint128) {
    return true;
  } else if (schemaType == SchemaType.Uint256) {
    return true;
  } else if (schemaType == SchemaType.Bytes4) {
    return true;
  } else if (schemaType == SchemaType.Address) {
    return true;
  } else {
    return false;
  }
}

enum ExecutionMode {
  Delegate,
  Autonomous
}
