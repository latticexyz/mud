// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// Acknowledgements:
// Based on @dk1a's Slice.sol library (https://github.com/dk1a/solidity-stringutils/blob/main/src/Slice.sol)
// Inspired by @ethier's DynamicBuffer.sol library (https://github.com/divergencetech/ethier/blob/main/contracts/utils/DynamicBuffer.sol)

// Optimized for allocating a fixed size buffer and writing to it / reading from it.

// First 16 bytes are the pointer to the data, followed by 16 bytes of data length.
type Buffer is uint256;

using Buffer_ for Buffer global;

library Buffer_ {
  uint256 constant MASK_CAPACITY = uint256(type(uint128).max);
  uint256 constant MASK_PTR = uint256(type(uint128).max) << 128;

  error Buffer_Overflow(uint256 capacity, uint256 requestedLength);

  /************************************************************************
   *
   *    STATIC FUNCTIONS
   *
   ************************************************************************/

  /**
   * @dev Allocates a new buffer with the given capacity.
   */
  function allocate(uint128 _capacity) internal pure returns (Buffer) {
    uint256 _ptr;
    assembly {
      let buf := mload(0x40) // free memory pointer
      mstore(0x40, add(buf, add(32, _capacity))) // 32 bytes for the buffer header, plus the length of the buffer
      mstore(buf, 0) // initialize length to 0 (memory is not cleared by default)
      _ptr := add(buf, 32) // ptr to first data byte
    }

    // Pointer is stored in upper 128 bits, capacity is stored in lower 128 bits
    return Buffer.wrap(((_ptr << 128) | _capacity));
  }

  /**
   * @dev Converts a bytes array to a buffer (without copying data)
   */
  function fromBytes(bytes memory data) internal pure returns (Buffer) {
    uint256 _ptr;
    assembly {
      _ptr := add(data, 32) // ptr to first data byte
    }

    // Pointer is stored in upper 128 bits, length is stored in lower 128 bits
    return Buffer.wrap((_ptr << 128) | uint128(data.length));
  }

  /************************************************************************
   *
   *    INSTANCE FUNCTIONS
   *
   ************************************************************************/

  /**
   * @dev Returns the pointer to the start of an in-memory buffer.
   */
  function ptr(Buffer self) internal pure returns (uint256) {
    return Buffer.unwrap(self) >> 128;
  }

  /**
   * @dev Returns the current length in bytes.
   */
  function length(Buffer self) internal pure returns (uint128 _length) {
    uint256 _ptr = ptr(self);
    assembly {
      _length := mload(sub(_ptr, 32))
    }
  }

  /**
   * @dev Returns the capacity in bytes.
   */
  function capacity(Buffer self) internal pure returns (uint128 _capacity) {
    return uint128(Buffer.unwrap(self));
  }

  /**
   * @dev Read a 32 bytes from the buffer starting at the given offset (without checking for overflows)
   */
  function read32(Buffer self, uint256 offset) internal pure returns (bytes32 value) {
    uint256 _ptr = ptr(self);
    assembly {
      value := mload(add(_ptr, offset))
    }
  }

  /**
   * @dev Read a 8 bytes from the buffer starting at the given offset (without checking for overflows)
   */
  function read8(Buffer self, uint256 offset) internal pure returns (bytes8 value) {
    return bytes8(read32(self, offset));
  }

  /**
   * @dev Read a 1 byte from the buffer starting at the given offset
   */
  function read1(Buffer self, uint256 offset) internal pure returns (bytes1 value) {
    return bytes1(read32(self, offset));
  }

  // TODO: add more typed utils to read from the buffer

  /**
   * @dev Appends the given bytes to the buffer (checking for overflows)
   */
  function append(Buffer self, bytes memory data) internal pure {
    uint128 _newLength = length(self) + uint128(data.length);
    checkCapacity(self, _newLength);
    appendUnchecked(self, data);
  }

  /**
   * @dev Appends bytes32 to the buffer (checking for overflows)
   */
  function append(Buffer self, bytes32 data) internal pure {
    append(self, data, 32);
  }

  /**
   * @dev Appends _dataLength of the given bytes32 to the buffer (checking for overflows)
   */
  function append(
    Buffer self,
    bytes32 data,
    uint128 _dataLength
  ) internal pure {
    uint128 _newLength = length(self) + _dataLength;
    checkCapacity(self, _newLength);
    appendUnchecked(self, data, _dataLength);
  }

  /**
   * @dev Appends _dataLength of the given bytes32 to the buffer (without checking for overflows)
   */
  function appendUnchecked(
    Buffer self,
    bytes32 data,
    uint128 _dataLength
  ) internal pure {
    uint256 _ptr = ptr(self);
    uint128 _length = length(self);

    // Update the current buffer length
    _setLengthUnchecked(self, _length + _dataLength);

    // Copy over given data to the buffer
    assembly {
      mstore(add(_ptr, _length), data)
    }
  }

  /**
   * @dev Appends the given bytes to the buffer (without checking for overflows)
   */
  function appendUnchecked(Buffer self, bytes memory data) internal pure {
    uint256 _ptr = ptr(self);
    uint128 _dataLength = uint128(data.length);
    uint128 _length = length(self);
    uint128 _newLength = _length + uint128(data.length);

    // Update the current buffer length
    _setLengthUnchecked(self, _newLength);

    // Copy over given data to the buffer
    assembly {
      for {
        let i := 0
      } lt(i, _dataLength) {
        i := add(i, 32)
      } {
        mstore(add(add(_ptr, _length), i), mload(add(data, add(32, i))))
      }
    }
  }

  /**
   * @dev returns the buffer as a bytes array (without copying the data)
   */
  function toBytes(Buffer self) internal pure returns (bytes memory _bytes) {
    uint256 _ptr = ptr(self);
    assembly {
      _bytes := sub(_ptr, 32)
    }
  }

  function slice(
    Buffer self,
    uint256 _start,
    uint256 _length
  ) internal pure returns (bytes memory) {
    return sliceBytes(toBytes(self), _start, _length);
  }

  /**
   * @dev copies a slice of the buffer to a new memory location and returns it as a bytes array (without checking for overflows)
   */

  /**
   * @dev copies the buffer contents to a new memory location and lays it out like a memory array with the given size per element (in bytes)
   * @return arrayPtr the pointer to the start of the array, needs to be casted to the expected type using assembly
   */
  function toArray(Buffer self, uint256 elementSize) internal pure returns (uint256 arrayPtr) {
    uint256 _ptr = ptr(self);
    uint128 _length = length(self);
    uint256 elementShift = 256 - elementSize * 8;

    assembly {
      arrayPtr := mload(0x40) // free memory pointer
      let arrayLen := div(_length, elementSize) // array length
      mstore(0x40, add(arrayPtr, add(mul(arrayLen, 32), 32))) // update free memory pointer (array length + array data)
      mstore(arrayPtr, arrayLen) // store array length

      for {
        let i := 0
        let arrayCursor := add(arrayPtr, 32) // skip array length
        let dataCursor := _ptr
      } lt(i, arrayLen) {
        // loop until we reach the end of the buffer
        i := add(i, 1)
        dataCursor := add(dataCursor, elementSize) // increment buffer pointer by one element size
        arrayCursor := add(arrayCursor, 32) // increment array pointer by one slot
      } {
        mstore(arrayCursor, shr(elementShift, mload(dataCursor))) // copy one element from buffer to array
      }
    }
  }

  /**
   * @dev Modify buffer length (checking capacity)
   */
  function _setLength(Buffer self, uint128 _length) internal pure {
    checkCapacity(self, _length);
    _setLengthUnchecked(self, _length);
  }

  /**
   * @dev Modify buffer length (without checking capacity)
   */
  function _setLengthUnchecked(Buffer self, uint128 _length) internal pure {
    uint256 _ptr = ptr(self);
    assembly {
      mstore(sub(_ptr, 32), _length)
    }
  }

  /**
   * @dev Check if the buffer has enough capacity to store a given length.
   */
  function checkCapacity(Buffer self, uint128 _length) internal pure {
    if (capacity(self) < _length) {
      revert Buffer_Overflow(capacity(self), _length);
    }
  }
}

// From https://github.com/GNSPS/solidity-bytes-utils/blob/master/contracts/BytesLib.sol
function sliceBytes(
  bytes memory _bytes,
  uint256 _start,
  uint256 _length
) pure returns (bytes memory) {
  require(_length + 31 >= _length, "slice_overflow");
  require(_bytes.length >= _start + _length, "slice_outOfBounds");

  bytes memory tempBytes;

  assembly {
    switch iszero(_length)
    case 0 {
      // Get a location of some free memory and store it in tempBytes as
      // Solidity does for memory variables.
      tempBytes := mload(0x40)

      // The first word of the slice result is potentially a partial
      // word read from the original array. To read it, we calculate
      // the length of that partial word and start copying that many
      // bytes into the array. The first word we copy will start with
      // data we don't care about, but the last `lengthmod` bytes will
      // land at the beginning of the contents of the new array. When
      // we're done copying, we overwrite the full first word with
      // the actual length of the slice.
      let lengthmod := and(_length, 31)

      // The multiplication in the next line is necessary
      // because when slicing multiples of 32 bytes (lengthmod == 0)
      // the following copy loop was copying the origin's length
      // and then ending prematurely not copying everything it should.
      let mc := add(add(tempBytes, lengthmod), mul(0x20, iszero(lengthmod)))
      let end := add(mc, _length)

      for {
        // The multiplication in the next line has the same exact purpose
        // as the one above.
        let cc := add(add(add(_bytes, lengthmod), mul(0x20, iszero(lengthmod))), _start)
      } lt(mc, end) {
        mc := add(mc, 0x20)
        cc := add(cc, 0x20)
      } {
        mstore(mc, mload(cc))
      }

      mstore(tempBytes, _length)

      //update free-memory pointer
      //allocating the array padded to 32 bytes like the compiler does now
      mstore(0x40, and(add(mc, 31), not(31)))
    }
    //if we want a zero-length slice let's just return a zero-length array
    default {
      tempBytes := mload(0x40)
      //zero out the 32 bytes slice we are about to return
      //we need to do it because Solidity does not garbage collect
      mstore(tempBytes, 0)

      mstore(0x40, add(tempBytes, 0x20))
    }
  }

  return tempBytes;
}
