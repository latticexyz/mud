// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// - 7 bytes accumulated counter
// - 5 bytes length per counter
type PackedCounter is bytes32;

using PackedCounterInstance for PackedCounter global;

uint256 constant ACC_BYTES = 7 * 8;
uint256 constant VAL_BYTES = 5 * 8;

/**
 * Static functions for PackedCounter
 */
library PackedCounterLib {
  function pack(uint40 a) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    uint56 accumulator = a;

    packedCounter = accumulator;
    unchecked {
      packedCounter |= (uint256(a) << ACC_BYTES);
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }

  function pack(uint40 a, uint40 b) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    uint56 accumulator = a + b;

    packedCounter = accumulator;
    unchecked {
      packedCounter |= (uint256(a) << (ACC_BYTES));
      packedCounter |= (uint256(b) << (ACC_BYTES + VAL_BYTES));
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }

  function pack(uint40 a, uint40 b, uint40 c) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    uint56 accumulator = a + b + c;

    packedCounter = accumulator;
    unchecked {
      packedCounter |= (uint256(a) << (ACC_BYTES));
      packedCounter |= (uint256(b) << (ACC_BYTES + VAL_BYTES));
      packedCounter |= (uint256(c) << (ACC_BYTES + VAL_BYTES * 2));
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }

  function pack(uint40 a, uint40 b, uint40 c, uint40 d) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    uint56 accumulator = a + b + c + d;

    packedCounter = accumulator;
    unchecked {
      packedCounter |= (uint256(a) << (ACC_BYTES));
      packedCounter |= (uint256(b) << (ACC_BYTES + VAL_BYTES));
      packedCounter |= (uint256(c) << (ACC_BYTES + VAL_BYTES * 2));
      packedCounter |= (uint256(d) << (ACC_BYTES + VAL_BYTES * 3));
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }

  function pack(uint40 a, uint40 b, uint40 c, uint40 d, uint40 e) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    uint56 accumulator = a + b + c + d + e;

    packedCounter = accumulator;
    unchecked {
      packedCounter |= (uint256(a) << (ACC_BYTES));
      packedCounter |= (uint256(b) << (ACC_BYTES + VAL_BYTES));
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
  /**
   * Decode the accumulated counter
   * (first 7 bytes of packed counter)
   */
  function total(PackedCounter packedCounter) internal pure returns (uint256) {
    return uint56(uint256(PackedCounter.unwrap(packedCounter)));
  }

  /**
   * Decode the counter at the given index
   * (5 bytes per counter after the first 7 bytes)
   */
  function atIndex(PackedCounter packedCounter, uint256 index) internal pure returns (uint256) {
    unchecked {
      return uint40(uint256(PackedCounter.unwrap(packedCounter) >> (ACC_BYTES + VAL_BYTES * index)));
    }
  }

  /**
   * Set a counter at the given index, return the new packed counter
   */
  function setAtIndex(
    PackedCounter packedCounter,
    uint256 index,
    uint256 newValueAtIndex
  ) internal pure returns (PackedCounter) {
    uint256 rawPackedCounter = uint256(PackedCounter.unwrap(packedCounter));

    // Get current lengths (total and at index)
    uint256 accumulator = total(packedCounter);
    uint256 currentValueAtIndex = atIndex(packedCounter, uint8(index));

    // Compute the difference and update the total value
    if (newValueAtIndex >= currentValueAtIndex) {
      accumulator += newValueAtIndex - currentValueAtIndex;
    } else {
      accumulator -= currentValueAtIndex - newValueAtIndex;
    }

    // Set the new accumulated value and value at index
    // (7 bytes total length, 5 bytes per dynamic schema)
    rawPackedCounter = (rawPackedCounter & ~uint256(type(uint56).max)) | accumulator;
    uint256 offset = ACC_BYTES + VAL_BYTES * index;
    uint256 mask = uint256(type(uint40).max) << offset;
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
