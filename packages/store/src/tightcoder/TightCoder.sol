// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { Slice, SliceLib } from "../Slice.sol";

/**
 * Low-level generic implementation of tight encoding for arrays, used by codegen.
 * This is the same as solidity's internal tight encoding for array data in storage.
 */
library TightCoder {
  /**
   * Copies the array to a new bytes array, tightly packing it.
   * elementSize is in bytes, leftPaddingBits is in bits.
   * elementSize and leftPaddingBits must be correctly provided by the caller based on the array's element type.
   * @return data a tightly packed array
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
   * Unpacks the slice to a new memory location and lays it out like a memory array.
   * elementSize is in bytes, leftPaddingBits is in bits.
   * elementSize and leftPaddingBits must be correctly provided by the caller based on the array's element type.
   * @return array a generic array, needs to be casted to the expected type using assembly
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

    // TODO temporary check to catch bugs, either remove it or use a custom error
    // (see https://github.com/latticexyz/mud/issues/444)
    if (packedLength % elementSize != 0) {
      revert("unpackToArray: packedLength must be a multiple of elementSize");
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
