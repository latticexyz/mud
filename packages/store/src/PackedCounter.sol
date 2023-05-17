// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Bytes } from "./Bytes.sol";

// - 7 bytes accumulated counter
// - 5 bytes length per counter
type PackedCounter is bytes32;

using PackedCounterLib for PackedCounter global;

library PackedCounterLib {
  /************************************************************************
   *
   *    STATIC FUNCTIONS
   *
   ************************************************************************/

  /**
   * Encode the given counters into a single packed counter
   * - 7 bytes for the accumulated length
   * - 5 bytes per counter -> max 5 counters
   */
  function pack(uint40[] memory counters) internal pure returns (PackedCounter) {
    bytes32 packedCounter;
    uint56 accumulator;

    // Compute the sum of all counters
    // and pack the counters
    for (uint256 i; i < counters.length; ) {
      packedCounter = Bytes.setBytes5(packedCounter, 7 + 5 * i, bytes5(counters[i]));
      accumulator += counters[i];
      unchecked {
        i++;
      }
    }

    // Store total length
    packedCounter = Bytes.setBytes7(packedCounter, 0, bytes7(accumulator));

    return PackedCounter.wrap(packedCounter);
  }

  // Overrides for pack function
  function pack(uint40 a) internal pure returns (PackedCounter) {
    uint40[] memory counters = new uint40[](1);
    counters[0] = a;
    return pack(counters);
  }

  function pack(uint40 a, uint40 b) internal pure returns (PackedCounter) {
    uint40[] memory counters = new uint40[](2);
    counters[0] = a;
    counters[1] = b;
    return pack(counters);
  }

  function pack(uint40 a, uint40 b, uint40 c) internal pure returns (PackedCounter) {
    uint40[] memory counters = new uint40[](3);
    counters[0] = a;
    counters[1] = b;
    counters[2] = c;
    return pack(counters);
  }

  function pack(uint40 a, uint40 b, uint40 c, uint40 d) internal pure returns (PackedCounter) {
    uint40[] memory counters = new uint40[](4);
    counters[0] = a;
    counters[1] = b;
    counters[2] = c;
    counters[3] = d;
    return pack(counters);
  }

  /************************************************************************
   *
   *    INSTANCE FUNCTIONS
   *
   ************************************************************************/

  /**
   * Decode the accumulated counter
   * (first 7 bytes of packed counter)
   */
  function total(PackedCounter packedCounter) internal pure returns (uint256) {
    return uint256(uint56(bytes7(PackedCounter.unwrap(packedCounter))));
  }

  /**
   * Decode the counter at the given index
   * (5 bytes per counter after the first 7 bytes)
   */
  function atIndex(PackedCounter packedCounter, uint256 index) internal pure returns (uint256) {
    uint256 offset = 7 + index * 5;
    return uint256(uint40(Bytes.slice5(PackedCounter.unwrap(packedCounter), offset)));
  }

  /**
   * Set a counter at the given index, return the new packed counter
   */
  function setAtIndex(
    PackedCounter packedCounter,
    uint256 index,
    uint256 newValueAtIndex
  ) internal pure returns (PackedCounter) {
    bytes32 rawPackedCounter = PackedCounter.unwrap(packedCounter);

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
    uint256 offset = 7 + index * 5; // (7 bytes total length, 5 bytes per dynamic schema)
    rawPackedCounter = Bytes.setBytes7(rawPackedCounter, 0, bytes7(uint56(accumulator)));
    rawPackedCounter = Bytes.setBytes5(rawPackedCounter, offset, bytes5(uint40(newValueAtIndex)));

    return PackedCounter.wrap(rawPackedCounter);
  }

  /*
   * Unwrap the packed counter
   */
  function unwrap(PackedCounter packedCounter) internal pure returns (bytes32) {
    return PackedCounter.unwrap(packedCounter);
  }
}
