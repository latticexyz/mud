// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/* Shared constants */

// Total byte length of an EVM word
uint256 constant WORD_SIZE = 32;
// Index of the last byte in an EVM word
uint256 constant WORD_LAST_INDEX = 31;
// Conversion for bit shifting
uint256 constant BYTE_TO_BITS = 8;

// Schema's capacity
uint256 constant MAX_TOTAL_FIELDS = 28;
// FieldLayout's capacity
uint256 constant MAX_STATIC_FIELDS = 28;
// PackedCounter's capacity
uint256 constant MAX_DYNAMIC_FIELDS = 5;

// FieldLayout and Schema have the same offsets for metadata
library LayoutOffsets {
  uint256 internal constant TOTAL_LENGTH = (WORD_SIZE - 2) * BYTE_TO_BITS;
  uint256 internal constant NUM_STATIC_FIELDS = (WORD_SIZE - 2 - 1) * BYTE_TO_BITS;
  uint256 internal constant NUM_DYNAMIC_FIELDS = (WORD_SIZE - 2 - 1 - 1) * BYTE_TO_BITS;
}
