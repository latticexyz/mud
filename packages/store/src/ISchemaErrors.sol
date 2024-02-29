// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

interface ISchemaErrors {
  /// @dev Error raised when the provided schema has an invalid length.
  error SchemaLib_InvalidLength(uint256 length);

  /// @dev Error raised when a static type is placed after a dynamic type in a schema.
  error SchemaLib_StaticTypeAfterDynamicType();
}
