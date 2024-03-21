// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title Shared constants for EVM and schema handling
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This file provides constants for better handling of EVM and Schema related functionalities.
 */

/// @dev Represents the total byte length of an EVM word.
uint256 constant WORD_SIZE = 32;

/// @dev Represents the index of the last byte in an EVM word.
uint256 constant WORD_LAST_INDEX = 31;

/// @dev Represents the conversion constant from byte to bits.
uint256 constant BYTE_TO_BITS = 8;

/// @dev Represents the maximum number of fields a Schema can handle.
uint256 constant MAX_TOTAL_FIELDS = 28;

/// @dev Represents the maximum number of static fields in a FieldLayout.
uint256 constant MAX_STATIC_FIELDS = 28;

/// @dev Represents the maximum number of dynamic fields that can be packed in EncodedLengths.
uint256 constant MAX_DYNAMIC_FIELDS = 5;

/**
 * @title LayoutOffsets Library
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This library provides constant offsets for FieldLayout and Schema metadata.
 * @dev FieldLayout and Schema utilize the same offset values for metadata.
 */
library LayoutOffsets {
  /// @notice Represents the total length offset within the EVM word.
  uint256 internal constant TOTAL_LENGTH = (WORD_SIZE - 2) * BYTE_TO_BITS;

  /// @notice Represents the number of static fields offset within the EVM word.
  uint256 internal constant NUM_STATIC_FIELDS = (WORD_SIZE - 2 - 1) * BYTE_TO_BITS;

  /// @notice Represents the number of dynamic fields offset within the EVM word.
  uint256 internal constant NUM_DYNAMIC_FIELDS = (WORD_SIZE - 2 - 1 - 1) * BYTE_TO_BITS;
}
