// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

interface IFieldLayoutErrors {
  error FieldLayoutLib_TooManyFields(uint256 numFields, uint256 maxFields);
  error FieldLayoutLib_TooManyDynamicFields(uint256 numFields, uint256 maxFields);
  error FieldLayoutLib_Empty();
  error FieldLayoutLib_InvalidStaticDataLength(uint256 staticDataLength, uint256 computedStaticDataLength);
  error FieldLayoutLib_StaticLengthIsZero(uint256 index);
  error FieldLayoutLib_StaticLengthIsNotZero(uint256 index);
  error FieldLayoutLib_StaticLengthDoesNotFitInAWord(uint256 index);
}
