// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PackedCounter } from "../src/PackedCounter.sol";
import { StoreCoreInternal } from "../src/StoreCore.sol";
import { Storage } from "../src/Storage.sol";

/**
 * Test helper function to set the length of the dynamic data (in bytes) for the given value field layout and index
 */
function setDynamicDataLengthAtIndex(
  bytes32 tableId,
  bytes32[] memory keyTuple,
  uint8 dynamicFieldIndex, // fieldIndex - numStaticFields
  uint256 newLengthAtIndex
) {
  // Load dynamic data length from storage
  uint256 dynamicDataLengthSlot = StoreCoreInternal._getDynamicDataLengthLocation(tableId, keyTuple);
  PackedCounter encodedLengths = PackedCounter.wrap(Storage.load({ storagePointer: dynamicDataLengthSlot }));

  // Update the encoded lengths
  encodedLengths = encodedLengths.setAtIndex(dynamicFieldIndex, newLengthAtIndex);

  // Set the new lengths
  Storage.store({ storagePointer: dynamicDataLengthSlot, data: encodedLengths.unwrap() });
}
