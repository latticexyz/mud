// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title ISchemaErrors
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This interface includes errors for the Schema library.
 * @dev We bundle these errors in an interface (instead of at the file-level or in their corresponding libraries) so they can be inherited by IStore.
 * This ensures that all possible errors are included in the IStore ABI for proper decoding in the frontend.
 */
interface ISchemaErrors {
  /**
   * @notice Error raised when the provided schema has an invalid length.
   * @param length The length of the schema.
   */
  error Schema_InvalidLength(uint256 length);

  /**
   * @notice Error raised when a static type is placed after a dynamic type in a schema.
   */
  error Schema_StaticTypeAfterDynamicType();
}
