// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Memory } from "./Memory.sol";
import { DecodeSlice } from "./tightcoder/DecodeSlice.sol";

// Acknowledgements:
// Based on @dk1a's Slice.sol library (https://github.com/dk1a/solidity-stringutils/blob/main/src/Slice.sol)

// First 16 bytes are the pointer to the data, followed by 16 bytes of data length.
type Slice is uint256;

using SliceInstance for Slice global;
using DecodeSlice for Slice global;

/**
 * @title Static functions for Slice
 */
library SliceLib {
  error Slice_OutOfBounds(bytes data, uint256 start, uint256 end);

  uint256 constant MASK_LEN = uint256(type(uint128).max);
  uint256 constant MASK_PTR = uint256(type(uint128).max) << 128;

  /**
   * @notice Converts a bytes array to a slice (without copying data)
   * @param data The bytes array to be converted
   * @return A new Slice representing the bytes array
   */
  function fromBytes(bytes memory data) internal pure returns (Slice) {
    uint256 _pointer;
    assembly {
      _pointer := add(data, 0x20) // pointer to first data byte
    }

    // Pointer is stored in upper 128 bits, length is stored in lower 128 bits
    return Slice.wrap((_pointer << 128) | (data.length & MASK_LEN));
  }

  /**
   * @notice Subslice a bytes array using the given start index until the end of the array (without copying data)
   * @param data The bytes array to subslice
   * @param start The start index for the subslice
   * @return A new Slice representing the subslice
   */
  function getSubslice(bytes memory data, uint256 start) internal pure returns (Slice) {
    return getSubslice(data, start, data.length);
  }

  /**
   * @notice Subslice a bytes array using the given indexes (without copying data)
   * @dev The start index is inclusive, the end index is exclusive
   * @param data The bytes array to subslice
   * @param start The start index for the subslice
   * @param end The end index for the subslice
   * @return A new Slice representing the subslice
   */
  function getSubslice(bytes memory data, uint256 start, uint256 end) internal pure returns (Slice) {
    // TODO this check helps catch bugs and can eventually be removed
    if (!(start <= end && end <= data.length)) revert Slice_OutOfBounds(data, start, end);

    uint256 _pointer;
    assembly {
      _pointer := add(data, 0x20) // pointer to first data byte
    }

    _pointer += start;
    uint256 _len = end - start;

    // Pointer is stored in upper 128 bits, length is stored in lower 128 bits
    return Slice.wrap((_pointer << 128) | (_len & MASK_LEN));
  }
}

/**
 * @title Instance functions for Slice
 */
library SliceInstance {
  /**
   * @notice Returns the pointer to the start of a slice
   * @param self The slice whose pointer needs to be fetched
   * @return The pointer to the start of the slice
   */
  function pointer(Slice self) internal pure returns (uint256) {
    return Slice.unwrap(self) >> 128;
  }

  /**
   * @notice Returns the slice length in bytes
   * @param self The slice whose length needs to be fetched
   * @return The length of the slice
   */
  function length(Slice self) internal pure returns (uint256) {
    return Slice.unwrap(self) & SliceLib.MASK_LEN;
  }

  /**
   * @notice Converts a Slice to bytes
   * @dev This function internally manages the conversion of a slice into a bytes format.
   * @param self The Slice to be converted to bytes.
   * @return data The bytes representation of the provided Slice.
   */
  function toBytes(Slice self) internal pure returns (bytes memory data) {
    uint256 fromPointer = pointer(self);
    uint256 _length = length(self);

    // Allocate a new bytes array and get the pointer to it
    data = new bytes(_length);
    uint256 toPointer;
    assembly {
      toPointer := add(data, 32)
    }
    // Copy the slice contents to the array
    Memory.copy(fromPointer, toPointer, _length);
  }

  /**
   * @notice Converts a Slice to bytes32
   * @dev This function converts a slice into a fixed-length bytes32. Uses inline assembly for the conversion.
   * @param self The Slice to be converted to bytes32.
   * @return result The bytes32 representation of the provided Slice.
   */
  function toBytes32(Slice self) internal pure returns (bytes32 result) {
    uint256 memoryPointer = self.pointer();
    /// @solidity memory-safe-assembly
    assembly {
      result := mload(memoryPointer)
    }
    return result;
  }
}
