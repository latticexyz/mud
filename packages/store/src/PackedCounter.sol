// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// - Last 7 bytes (uint56) are used for the total byte length of the dynamic data
// - The next 5 byte (uint40) sections are used for the byte length of each field, indexed from right to left
type PackedCounter is bytes32;

using PackedCounterInstance for PackedCounter global;

uint256 constant ACC_BYTES = 7 * 8;
uint256 constant VAL_BYTES = 5 * 8;
uint256 constant MAX_VAL = type(uint40).max;

/**
 * Static functions for PackedCounter
 * The caller must ensure that the value arguments are <= MAX_VAL
 */
library PackedCounterLib {
  function pack(uint256 a) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    unchecked {
      packedCounter = a;
      packedCounter |= (uint256(a) << (ACC_BYTES + VAL_BYTES * 0));
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }

  function pack(uint256 a, uint256 b) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    unchecked {
      packedCounter = a + b;
      packedCounter |= (uint256(a) << (ACC_BYTES + VAL_BYTES * 0));
      packedCounter |= (uint256(b) << (ACC_BYTES + VAL_BYTES * 1));
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }

  function pack(uint256 a, uint256 b, uint256 c) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    unchecked {
      packedCounter = a + b + c;
      packedCounter |= (uint256(a) << (ACC_BYTES + VAL_BYTES * 0));
      packedCounter |= (uint256(b) << (ACC_BYTES + VAL_BYTES * 1));
      packedCounter |= (uint256(c) << (ACC_BYTES + VAL_BYTES * 2));
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }

  function pack(uint256 a, uint256 b, uint256 c, uint256 d) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    unchecked {
      packedCounter = a + b + c + d;
      packedCounter |= (uint256(a) << (ACC_BYTES + VAL_BYTES * 0));
      packedCounter |= (uint256(b) << (ACC_BYTES + VAL_BYTES * 1));
      packedCounter |= (uint256(c) << (ACC_BYTES + VAL_BYTES * 2));
      packedCounter |= (uint256(d) << (ACC_BYTES + VAL_BYTES * 3));
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }

  function pack(uint256 a, uint256 b, uint256 c, uint256 d, uint256 e) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    unchecked {
      packedCounter = a + b + c + d + e;
      packedCounter |= (uint256(a) << (ACC_BYTES + VAL_BYTES * 0));
      packedCounter |= (uint256(b) << (ACC_BYTES + VAL_BYTES * 1));
      packedCounter |= (uint256(c) << (ACC_BYTES + VAL_BYTES * 2));
      packedCounter |= (uint256(d) << (ACC_BYTES + VAL_BYTES * 3));
      packedCounter |= (uint256(e) << (ACC_BYTES + VAL_BYTES * 4));
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }
}

/**
 * Instance functions for PackedCounter
 */
library PackedCounterInstance {
  error PackedCounter_InvalidLength(uint256 length);

  /**
   * Decode the accumulated counter
   * (right-most 7 bytes of packed counter)
   */
  function total(PackedCounter packedCounter) internal pure returns (uint256) {
    return uint56(uint256(PackedCounter.unwrap(packedCounter)));
  }

  /**
   * Decode the counter at the given index
   * (right-to-left, 5 bytes per counter after the right-most 7 bytes)
   */
  function atIndex(PackedCounter packedCounter, uint8 index) internal pure returns (uint256) {
    unchecked {
      return uint40(uint256(PackedCounter.unwrap(packedCounter) >> (ACC_BYTES + VAL_BYTES * index)));
    }
  }

  /**
   * Set a counter at the given index, return the new packed counter
   */
  function setAtIndex(
    PackedCounter packedCounter,
    uint8 index,
    uint256 newValueAtIndex
  ) internal pure returns (PackedCounter) {
    if (newValueAtIndex > MAX_VAL) {
      revert PackedCounter_InvalidLength(newValueAtIndex);
    }

    uint256 rawPackedCounter = uint256(PackedCounter.unwrap(packedCounter));

    // Get current lengths (total and at index)
    uint256 accumulator = total(packedCounter);
    uint256 currentValueAtIndex = atIndex(packedCounter, index);

    // Compute the difference and update the total value
    unchecked {
      if (newValueAtIndex >= currentValueAtIndex) {
        accumulator += newValueAtIndex - currentValueAtIndex;
      } else {
        accumulator -= currentValueAtIndex - newValueAtIndex;
      }
    }

    // Set the new accumulated value and value at index
    // (7 bytes total length, 5 bytes per dynamic schema)
    uint256 offset;
    unchecked {
      offset = ACC_BYTES + VAL_BYTES * index;
    }
    // Bitmask with 1s at the 5 bytes that form the value slot at the given index
    uint256 mask = uint256(type(uint40).max) << offset;

    // First set the last 7 bytes to 0, then set them to the new length
    rawPackedCounter = (rawPackedCounter & ~uint256(type(uint56).max)) | accumulator;

    // Zero out the value slot at the given index, then set the new value
    rawPackedCounter = (rawPackedCounter & ~mask) | ((newValueAtIndex << offset) & mask);

    return PackedCounter.wrap(bytes32(rawPackedCounter));
  }

  /*
   * Unwrap the packed counter
   */
  function unwrap(PackedCounter packedCounter) internal pure returns (bytes32) {
    return PackedCounter.unwrap(packedCounter);
  }
}
