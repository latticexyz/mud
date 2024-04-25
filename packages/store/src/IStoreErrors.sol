// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "./ResourceId.sol";

/**
 * @title IStoreErrors
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This interface includes errors for Store.
 * @dev We bundle these errors in an interface (instead of at the file-level or in their corresponding library) so they can be inherited by IStore.
 * This ensures that all possible errors are included in the IStore ABI for proper decoding in the frontend.
 */
interface IStoreErrors {
  /**
   * @notice Error raised if the provided table already exists.
   * @param tableId The ID of the table.
   * @param tableIdString The stringified ID of the table (for easier debugging if cleartext tableIds are used).
   */
  error Store_TableAlreadyExists(ResourceId tableId, string tableIdString);
  /**
   * @notice Error raised if the provided table cannot be found.
   * @param tableId The ID of the table.
   * @param tableIdString The stringified ID of the table (for easier debugging if cleartext tableIds are used).
   */
  error Store_TableNotFound(ResourceId tableId, string tableIdString);
  /**
   * @notice Error raised if the provided resource ID cannot be found.
   * @param expected The expected resource type.
   * @param resourceId The resource ID.
   * @param resourceIdString The stringified resource ID (for easier debugging).
   */
  error Store_InvalidResourceType(bytes2 expected, ResourceId resourceId, string resourceIdString);

  /**
   * @notice Error raised if the provided slice bounds are invalid.
   * @param start The start index within the dynamic field for the slice operation (inclusive).
   * @param end The end index within the dynamic field for the slice operation (exclusive).
   */
  error Store_InvalidBounds(uint256 start, uint256 end);
  /**
   * @notice Error raised if the provided index is out of bounds.
   * @dev Raised if the start index is larger than the previous length of the field.
   * @param length FIXME
   * @param accessedIndex FIXME
   */
  error Store_IndexOutOfBounds(uint256 length, uint256 accessedIndex);
  /**
   * @notice Error raised if the provided static data length is invalid.
   * @param expected The expected length.
   * @param received The provided length.
   */
  error Store_InvalidStaticDataLength(uint256 expected, uint256 received);
  /**
   * @notice Error raised if the provided key names length is invalid.
   * @param expected The expected length.
   * @param received The provided length.
   */
  error Store_InvalidKeyNamesLength(uint256 expected, uint256 received);
  /**
   * @notice Error raised if the provided field names length is invalid.
   * @param expected The expected length.
   * @param received The provided length.
   */
  error Store_InvalidFieldNamesLength(uint256 expected, uint256 received);
  /**
   * @notice Error raised if the provided value schema length is invalid.
   * @param expected The expected length.
   * @param received The provided length.
   */
  error Store_InvalidValueSchemaLength(uint256 expected, uint256 received);
  /**
   * @notice Error raised if the provided schema static length is invalid.
   * @param expected The expected length.
   * @param received The provided length.
   */
  error Store_InvalidValueSchemaStaticLength(uint256 expected, uint256 received);
  /**
   * @notice Error raised if the provided schema dynamic length is invalid.
   * @param expected The expected length.
   * @param received The provided length.
   */
  error Store_InvalidValueSchemaDynamicLength(uint256 expected, uint256 received);
  /**
   * @notice Error raised if the provided splice is invalid.
   * @dev Raised if the splice total length of the field is changed but the splice is not at the end of the field.
   * @param startWithinField The start index within the field for the splice operation.
   * @param deleteCount The number of bytes to delete in the splice operation.
   * @param fieldLength The field length for the splice operation.
   */
  error Store_InvalidSplice(uint40 startWithinField, uint40 deleteCount, uint40 fieldLength);
}
