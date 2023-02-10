// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "./Types.sol";
import { Memory } from "./Memory.sol";
import { DecodeSlice } from "./storagecoder/DecodeSlice.sol";

// Acknowledgements:
// Based on @dk1a's Slice.sol library (https://github.com/dk1a/solidity-stringutils/blob/main/src/Slice.sol)

// First 16 bytes are the pointer to the data, followed by 16 bytes of data length.
type Slice is uint256;

using SliceInstance for Slice global;
using DecodeSlice for Slice global;

/**
 * @title Static functions for Slice
 */
library Slice_ {
  error Slice_OutOfBounds();

  uint256 constant MASK_LEN = uint256(type(uint128).max);
  uint256 constant MASK_PTR = uint256(type(uint128).max) << 128;

  /**
   * @dev Converts a bytes array to a slice (without copying data)
   */
  function fromBytes(bytes memory data) internal pure returns (Slice) {
    uint256 _ptr;
    assembly {
      _ptr := add(data, 0x20) // ptr to first data byte
    }

    // Pointer is stored in upper 128 bits, length is stored in lower 128 bits
    return Slice.wrap((_ptr << 128) | (data.length & MASK_LEN));
  }

  /**
   * @dev Subslice a bytes array using the given indexes (without copying data)
   */
  function getSubslice(
    bytes memory data,
    uint256 start,
    uint256 end
  ) internal pure returns (Slice) {
    // TODO this check helps catch bugs and can eventually be removed
    if (!(start <= end && end <= data.length)) revert Slice_OutOfBounds();

    uint256 _ptr;
    assembly {
      _ptr := add(data, 0x20) // ptr to first data byte
    }

    _ptr += start;
    uint256 _len = end - start;

    // Pointer is stored in upper 128 bits, length is stored in lower 128 bits
    return Slice.wrap((_ptr << 128) | (_len & MASK_LEN));
  }
}

/**
 * @title Instance functions for Slice
 */
library SliceInstance {
  /**
   * @dev Returns the pointer to the start of a slice
   */
  function ptr(Slice self) internal pure returns (uint256) {
    return Slice.unwrap(self) >> 128;
  }

  /**
   * @dev Returns the slice length in bytes
   */
  function length(Slice self) internal pure returns (uint256) {
    return Slice.unwrap(self) & Slice_.MASK_LEN;
  }

  /**
   * @dev Copies the slice to a new bytes array
   * The slice will NOT point to the new bytes array
   */
  function toBytes(Slice self) internal view returns (bytes memory data) {
    uint256 ptrSrc = ptr(self);
    uint256 _length = length(self);

    // Allocate a new bytes array and get the pointer to it
    data = new bytes(_length);
    uint256 ptrDest;
    assembly {
      ptrDest := add(data, 32)
    }
    // Copy the slice contents to the array
    Memory.copy(ptrDest, ptrSrc, _length);
  }

  function toBytes32(Slice self) internal pure returns (bytes32 result) {
    uint256 memoryPointer = self.ptr();
    /// @solidity memory-safe-assembly
    assembly {
      result := mload(memoryPointer)
    }
    return result;
  }
}
