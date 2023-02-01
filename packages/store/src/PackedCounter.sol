// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType, getStaticByteLength } from "./Types.sol";
import { Bytes } from "./Bytes.sol";

// - 4 bytes accumulated counter
// - 2 bytes length per counter
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
   * - 4 bytes for the accumulated length
   * - 2 bytes per counter -> max 14 counters
   */
  function pack(uint16[] memory counters) internal pure returns (PackedCounter) {
    bytes32 packedCounter;
    uint32 accumulator;

    // Compute the sum of all counters
    // and pack the counters
    for (uint256 i; i < counters.length; ) {
      packedCounter = Bytes.setBytes2(packedCounter, 4 + 2 * i, bytes2(counters[i]));
      accumulator += counters[i];
      unchecked {
        i++;
      }
    }

    // Store total length
    packedCounter = Bytes.setBytes4(packedCounter, 0, bytes4(accumulator));

    return PackedCounter.wrap(packedCounter);
  }

  // Overrides for pack function
  function pack(uint16 a) internal pure returns (PackedCounter) {
    uint16[] memory counters = new uint16[](1);
    counters[0] = a;
    return pack(counters);
  }

  function pack(uint16 a, uint16 b) internal pure returns (PackedCounter) {
    uint16[] memory counters = new uint16[](2);
    counters[0] = a;
    counters[1] = b;
    return pack(counters);
  }

  function pack(
    uint16 a,
    uint16 b,
    uint16 c
  ) internal pure returns (PackedCounter) {
    uint16[] memory counters = new uint16[](3);
    counters[0] = a;
    counters[1] = b;
    counters[2] = c;
    return pack(counters);
  }

  function pack(
    uint16 a,
    uint16 b,
    uint16 c,
    uint16 d
  ) internal pure returns (PackedCounter) {
    uint16[] memory counters = new uint16[](4);
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
   * (first four bytes of packed counter)
   */
  function total(PackedCounter packedCounter) internal pure returns (uint256) {
    return uint256(uint32(bytes4(PackedCounter.unwrap(packedCounter))));
  }

  /**
   * Decode the counter at the given index
   * (two bytes per counter after the first four bytes)
   */
  function atIndex(PackedCounter packedCounter, uint256 index) internal pure returns (uint256) {
    uint256 offset = 4 + index * 2;
    return uint256(uint16(Bytes.slice2(PackedCounter.unwrap(packedCounter), offset)));
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
    int256 lengthDiff = int256(newValueAtIndex) - int256(currentValueAtIndex);
    accumulator = uint256(int256(accumulator) + lengthDiff);

    // Set the new accumulated value and value at index
    uint256 offset = 4 + index * 2; // (4 bytes total length, 2 bytes per dynamic schema)
    rawPackedCounter = Bytes.setBytes4(rawPackedCounter, 0, bytes4(uint32(accumulator)));
    rawPackedCounter = Bytes.setBytes2(rawPackedCounter, offset, bytes2(uint16(newValueAtIndex)));

    return PackedCounter.wrap(rawPackedCounter);
  }

  /*
   * Unwrap the packed counter
   */
  function unwrap(PackedCounter packedCounter) internal pure returns (bytes32) {
    return PackedCounter.unwrap(packedCounter);
  }
}
