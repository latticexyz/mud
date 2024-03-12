// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title IFieldLayoutErrors
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This interface includes errors for the FieldLayout library.
 * @dev We bundle these errors in an interface (instead of at the file-level or in their corresponding libraries) so they can be inherited by IStore.
 * This ensures that all possible errors are included in the IStore ABI for proper decoding in the frontend.
 */
interface IFieldLayoutErrors {
  /**
   * @notice Error raised when the provided field layout has too many fields.
   * @param numFields The total number of fields in the field layout.
   * @param maxFields The maximum number of fields a Schema can handle.
   */
  error FieldLayout_TooManyFields(uint256 numFields, uint256 maxFields);
  /**
   * @notice Error raised when the provided field layout has too many dynamic fields.
   * @param numFields The total number of fields in the field layout.
   * @param maxFields The maximum number of fields a Schema can handle.
   */
  error FieldLayout_TooManyDynamicFields(uint256 numFields, uint256 maxFields);
  /**
   * @notice Error raised when the provided field layout is empty.
   */
  error FieldLayout_Empty();
  /**
   * @notice Error raised when the provided field layout has an invalid static data length.
   * @param staticDataLength The static data length of the field layout.
   * @param computedStaticDataLength The computed static data length.
   */
  error FieldLayout_InvalidStaticDataLength(uint256 staticDataLength, uint256 computedStaticDataLength);
  /**
   * @notice Error raised when the provided field layout has a static data length of zero.
   * @param index The index of the field.
   */
  error FieldLayout_StaticLengthIsZero(uint256 index);
  /**
   * @notice Error raised when the provided field layout has a nonzero static data length.
   * @param index The index of the field.
   */
  error FieldLayout_StaticLengthIsNotZero(uint256 index);
  /**
   * @notice Error raised when the provided field layout has a static data length that does not fit in a word (32 bytes).
   * @param index The index of the field.
   */
  error FieldLayout_StaticLengthDoesNotFitInAWord(uint256 index);
}
