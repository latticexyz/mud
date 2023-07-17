// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

struct Layout {
  /**
   * Returns the Store address used by this consumer (like Hooks, Store itself, World Systems, or tests/scripts)
   * for StoreSwitch to determine how to interact with the Store.
   * 0x00 is magic for msg.sender.
   * 0x01 is magic for address(this).
   */
  address storeAddress;
}

bytes32 constant STORAGE_SLOT = keccak256("store.contracts.storage.StoreConsumer");

function setStoreAddress(address storeAddress) {
  Layout storage l;
  bytes32 slot = STORAGE_SLOT;
  assembly {
    l.slot := slot
  }

  l.storeAddress = storeAddress;
}

function getStoreAddress() view returns (address storeAddress) {
  Layout storage l;
  bytes32 slot = STORAGE_SLOT;
  assembly {
    l.slot := slot
  }

  return l.storeAddress;
}
