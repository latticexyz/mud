// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title IFieldLayoutErrors
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This interface includes errors for the FieldLayout library.
 */
interface IFieldLayoutErrors {
  error FieldLayout_TooManyFields(uint256 numFields, uint256 maxFields);
  error FieldLayout_TooManyDynamicFields(uint256 numFields, uint256 maxFields);
  error FieldLayout_Empty();
  error FieldLayout_InvalidStaticDataLength(uint256 staticDataLength, uint256 computedStaticDataLength);
  error FieldLayout_StaticLengthIsZero(uint256 index);
  error FieldLayout_StaticLengthIsNotZero(uint256 index);
  error FieldLayout_StaticLengthDoesNotFitInAWord(uint256 index);
}
