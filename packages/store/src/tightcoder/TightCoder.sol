// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Slice, SliceLib } from "../Slice.sol";

/**
 * @title TightCoder
 * @dev Provides low-level generic implementations of tight encoding and decoding for arrays.
 * This is consistent with Solidity's internal tight encoding for array data in storage.
 */
library TightCoder {
  /**
   * @dev Copies the array to a new bytes array, tightly packing its elements.
   * @param array The array to encode.
   * @param elementSize The size of each element in bytes.
   * @param leftPaddingBits The number of bits to pad on the left for each element.
   * @return data A tightly packed byte array.
   * @notice elementSize and leftPaddingBits must be correctly provided by the caller based on the array's element type.
   */
  function encode(
    bytes32[] memory array,
    uint256 elementSize,
    uint256 leftPaddingBits
  ) internal pure returns (bytes memory data) {
    uint256 arrayLength = array.length;
    uint256 packedLength = array.length * elementSize;

    // Manual memory allocation is cheaper and removes the issue of memory corruption at the tail
    /// @solidity memory-safe-assembly
    assembly {
      // Solidity's YulUtilFunctions::roundUpFunction
      function round_up_to_mul_of_32(value) -> _result {
        _result := and(add(value, 31), not(31))
      }

      // Allocate memory
      data := mload(0x40)
      let packedPointer := add(data, 0x20)
      mstore(0x40, round_up_to_mul_of_32(add(packedPointer, packedLength)))
      // Store length
      mstore(data, packedLength)

      for {
        let i := 0
        // Skip array length
        let arrayPointer := add(array, 0x20)
      } lt(i, arrayLength) {
        // Loop until we reach the end of the array
        i := add(i, 1)
        // Increment array pointer by one word
        arrayPointer := add(arrayPointer, 0x20)
        // Increment packed pointer by one element size
        packedPointer := add(packedPointer, elementSize)
      } {
        // Pack one array element
        mstore(packedPointer, shl(leftPaddingBits, mload(arrayPointer)))
      }
    }
  }

  /**
   * @notice Decodes a tightly packed byte slice into a bytes32 array.
   * @param packedSlice The tightly packed data to be decoded.
   * @param elementSize The size of each element in bytes.
   * @param leftPaddingBits The number of padding bits on the left side of each element.
   * @dev elementSize and leftPaddingBits must be correctly provided based on the desired output array's element type.
   * @return array The resulting array of bytes32 elements from decoding the packed slice.
   */
  function decode(
    Slice packedSlice,
    uint256 elementSize,
    uint256 leftPaddingBits
  ) internal pure returns (bytes32[] memory array) {
    uint256 packedPointer = packedSlice.pointer();
    uint256 packedLength = packedSlice.length();
    // Array length (number of elements)
    uint256 arrayLength;
    unchecked {
      arrayLength = packedLength / elementSize;
    }

    /// @solidity memory-safe-assembly
    assembly {
      // Allocate memory
      array := mload(0x40)
      let arrayPointer := add(array, 0x20)
      mstore(0x40, add(arrayPointer, mul(arrayLength, 32)))
      // Store length
      mstore(array, arrayLength)

      for {
        let i := 0
      } lt(i, arrayLength) {
        // Loop until we reach the end of the array
        i := add(i, 1)
        // Increment array pointer by one word
        arrayPointer := add(arrayPointer, 0x20)
        // Increment packed pointer by one element size
        packedPointer := add(packedPointer, elementSize)
      } {
        // Unpack one array element
        mstore(arrayPointer, shr(leftPaddingBits, mload(packedPointer)))
      }
    }
  }
}
