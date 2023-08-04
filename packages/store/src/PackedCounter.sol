// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// - 7 bytes accumulated counter
// - 5 bytes length per counter
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
  error PackedCounter_InvalidLength(uint256 length);

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

  function requireValidLength(uint256 length) internal pure {
    if (length > MAX_VAL) {
      revert PackedCounter_InvalidLength(length);
    }
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
      revert PackedCounterLib.PackedCounter_InvalidLength(newValueAtIndex);
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
    uint256 mask = uint256(type(uint40).max) << offset;
    rawPackedCounter = (rawPackedCounter & ~uint256(type(uint56).max)) | accumulator;
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
