// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Slice, SliceLib } from "../Slice.sol";
import { SchemaType } from "../Types.sol";

library TightCoder {
  /**
   * @dev Copies the array to the location of `packedSlice`,
   * tightly packing it using the given size per element (in bytes)
   *
   * TODO this function is currently not used externally and will be changed in the future
   * (see https://github.com/latticexyz/mud/issues/444)
   */
  function _encodeToLocation(
    bytes32[] memory array,
    Slice packedSlice,
    uint256 elementSize,
    bool leftAligned
  ) private pure {
    uint256 arrayLength = array.length;
    uint256 packedPointer = packedSlice.pointer();
    uint256 shiftLeft = leftAligned ? 0 : 256 - elementSize * 8;

    // TODO temporary check to catch bugs, either remove it or use a custom error
    // (see https://github.com/latticexyz/mud/issues/444)
    uint256 packedLength = arrayLength * elementSize;
    if (packedLength > packedSlice.length()) {
      revert("packFromArray: insufficient allocated packedSlice length");
    }

    /// @solidity memory-safe-assembly
    assembly {
      for {
        let i := 0
        let arrayCursor := add(array, 0x20) // skip array length
        let packedCursor := packedPointer
      } lt(i, arrayLength) {
        // Loop until we reach the end of the array
        i := add(i, 1)
        arrayCursor := add(arrayCursor, 0x20) // increment array pointer by one word
        packedCursor := add(packedCursor, elementSize) // increment packed pointer by one element size
      } {
        mstore(packedCursor, shl(shiftLeft, mload(arrayCursor))) // pack one array element
      }
    }
  }

  /**
   * @dev Copies the array to a new bytes array,
   * tightly packing it using the given size per element (in bytes)
   */
  function encode(
    bytes32[] memory array,
    uint256 elementSize,
    bool leftAligned
  ) internal pure returns (bytes memory data) {
    uint256 packedLength = array.length * elementSize;
    data = new bytes(packedLength);
    _encodeToLocation(array, SliceLib.fromBytes(data), elementSize, leftAligned);
  }

  /**
   * @dev Unpacks the slice to a new memory location
   * and lays it out like a memory array with the given size per element (in bytes)
   * @return array a generic array, needs to be casted to the expected type using assembly
   */
  function decode(
    Slice packedSlice,
    uint256 elementSize,
    bool leftAligned
  ) internal pure returns (bytes32[] memory array) {
    uint256 packedPointer = packedSlice.pointer();
    uint256 packedLength = packedSlice.length();
    uint256 padLeft = leftAligned ? 0 : 256 - elementSize * 8;
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
      // Allocate a word for each element, and a word for the array's length
      let allocateBytes := add(mul(arrayLength, 32), 0x20)
      // Allocate memory and update the free memory pointer
      array := mload(0x40)
      mstore(0x40, add(array, allocateBytes))

      // Store array length
      mstore(array, arrayLength)

      for {
        let i := 0
        let arrayCursor := add(array, 0x20) // skip array length
        let packedCursor := packedPointer
      } lt(i, arrayLength) {
        // Loop until we reach the end of the array
        i := add(i, 1)
        arrayCursor := add(arrayCursor, 0x20) // increment array pointer by one word
        packedCursor := add(packedCursor, elementSize) // increment packed pointer by one element size
      } {
        mstore(arrayCursor, shr(padLeft, mload(packedCursor))) // unpack one array element
      }
    }
  }
}
