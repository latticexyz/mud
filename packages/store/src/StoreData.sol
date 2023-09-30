// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { STORE_VERSION } from "./version.sol";
import { IStoreData } from "./IStoreData.sol";
import { StoreRead } from "./StoreRead.sol";
import { StoreCore } from "./StoreCore.sol";

/**
 * @title Store Data Contract
 * @notice This contract integrates the core storage functionalities and provides an interface for data storage.
 * @dev This abstract contract initializes `StoreCore`, implements `storeVersion`, and read methods,
 * but not write methods.
 */
abstract contract StoreData is IStoreData, StoreRead {
  /**
   * @notice Constructs the StoreData contract and initializes the StoreCore.
   * @dev Emits a HelloStore event upon creation.
   */
  constructor() {
    StoreCore.initialize();
    emit HelloStore(STORE_VERSION);
  }

  /**
   * @notice Retrieves the version of the store.
   * @return The current version of the store as a bytes32.
   */
  function storeVersion() public pure returns (bytes32) {
    return STORE_VERSION;
  }
}
