// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";

import { InTableKeys } from "./tables/InTableKeys.sol";
import { InTableIndex } from "./tables/InTableIndex.sol";

/**
 * Note: if a table with composite keys is used, only the first key is indexed
 */
contract KeysInTableHook is IStoreHook {
  function handleSet(bytes32 tableId, bytes32[] memory key) internal {
    bytes32 keysHash = keccak256(abi.encode(key));

    // If the key has not yet been set in the table...
    if (!InTableIndex.getHas(tableId, keysHash)) {
      uint256 length = InTableKeys.length(tableId);

      // Push the key to the list of keys in this table
      InTableKeys.push(tableId, key[0]);

      // Update the index to avoid duplicating this key in the array
      InTableIndex.set(tableId, keysHash, true, uint32(length));
    }
  }

  function onSetRecord(bytes32 tableId, bytes32[] memory key, bytes memory) public {
    handleSet(tableId, key);
  }

  function onBeforeSetField(bytes32, bytes32[] memory, uint8, bytes memory) public {}

  function onAfterSetField(bytes32 tableId, bytes32[] memory key, uint8, bytes memory) public {
    handleSet(tableId, key);
  }

  function onDeleteRecord(bytes32 tableId, bytes32[] memory key) public {
    bytes32 keysHash = keccak256(abi.encode(key));
    (bool has, uint32 index) = InTableIndex.get(tableId, keysHash);

    // If the key was part of the table...
    if (has) {
      // Delete the index as the key is not in the table
      InTableIndex.deleteRecord(tableId, keysHash);

      uint256 length = InTableKeys.length(tableId);

      if (length == 1) {
        // Delete the list of keys in this table
        InTableKeys.deleteRecord(tableId);
      } else {
        bytes32 lastKey = InTableKeys.getItem(tableId, length - 1);

        // Remove the key from the list of keys in this table
        InTableKeys.update(tableId, index, lastKey);
        InTableKeys.pop(tableId);
      }
    }
  }
}
