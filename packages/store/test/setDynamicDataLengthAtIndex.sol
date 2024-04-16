// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { EncodedLengths } from "../src/EncodedLengths.sol";
import { StoreCoreInternal } from "../src/StoreCore.sol";
import { Storage } from "../src/Storage.sol";
import { ResourceId } from "../src/ResourceId.sol";

/**
 * Test helper function to set the length of the dynamic data (in bytes) for the given value field layout and index
 */
function setDynamicDataLengthAtIndex(
  ResourceId tableId,
  bytes32[] memory keyTuple,
  uint8 dynamicFieldIndex, // fieldIndex - numStaticFields
  uint256 newLengthAtIndex
) {
  // Load dynamic data length from storage
  uint256 dynamicDataLengthSlot = StoreCoreInternal._getDynamicDataLengthLocation(tableId, keyTuple);
  EncodedLengths encodedLengths = EncodedLengths.wrap(Storage.load({ storagePointer: dynamicDataLengthSlot }));

  // Update the encoded lengths
  encodedLengths = encodedLengths.setAtIndex(dynamicFieldIndex, newLengthAtIndex);

  // Set the new lengths
  Storage.store({ storagePointer: dynamicDataLengthSlot, data: encodedLengths.unwrap() });
}
