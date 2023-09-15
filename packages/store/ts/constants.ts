/* Shared constants */
// Make sure these stay aligned with @latticexyz/store/src/constants.sol

// Total byte length of an EVM word
export const WORD_SIZE = 32;
// Index of the last byte in an EVM word
export const WORD_LAST_INDEX = 31;
// Conversion for bit shifting
export const BYTE_TO_BITS = 8;

// Schema's capacity
export const MAX_TOTAL_FIELDS = 28;
// FieldLayout's capacity
export const MAX_STATIC_FIELDS = 28;
// PackedCounter's capacity
export const MAX_DYNAMIC_FIELDS = 5;

// FieldLayout and Schema have the same offsets for metadata
export const LayoutOffsets = {
  TOTAL_LENGTH: (WORD_SIZE - 2) * BYTE_TO_BITS,
  NUM_STATIC_FIELDS: (WORD_SIZE - 2 - 1) * BYTE_TO_BITS,
  NUM_DYNAMIC_FIELDS: (WORD_SIZE - 2 - 1 - 1) * BYTE_TO_BITS,
};
