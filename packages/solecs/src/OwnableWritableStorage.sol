// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

library OwnableWritableStorage {
  struct Layout {
    /** Addresses with write access */
    mapping(address => bool) writeAccess;
  }

  bytes32 internal constant STORAGE_SLOT = keccak256("solecs.contracts.storage.OwnableWritable");

  function layout() internal pure returns (Layout storage l) {
    bytes32 slot = STORAGE_SLOT;
    assembly {
      l.slot := slot
    }
  }
}
