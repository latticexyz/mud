// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title ISchemaErrors
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This interface includes errors for the Schema library.
 */
interface ISchemaErrors {
  /// @dev Error raised when the provided schema has an invalid length.
  error Schema_InvalidLength(uint256 length);

  /// @dev Error raised when a static type is placed after a dynamic type in a schema.
  error Schema_StaticTypeAfterDynamicType();
}
