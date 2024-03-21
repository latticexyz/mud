// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { STORE_VERSION } from "./version.sol";
import { IStore } from "./IStore.sol";
import { StoreRead } from "./StoreRead.sol";
import { StoreCore } from "./StoreCore.sol";
import { IStoreEvents } from "./IStoreEvents.sol";
import { IStoreKernel } from "./IStoreKernel.sol";

/**
 * @title StoreKernel Contract
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This contract integrates the storage functionalities except registration and provides an interface for data storage.
 * @dev This abstract contract initializes `StoreCore`, implements `storeVersion`, and read methods.
 */
abstract contract StoreKernel is IStoreKernel, StoreRead {
  /**
   * @notice Constructs the StoreKernel contract and initializes the StoreCore.
   * @dev Emits a HelloStore event upon creation.
   */
  constructor() {
    StoreCore.initialize();
    emit IStoreEvents.HelloStore(STORE_VERSION);
  }

  /**
   * @notice Retrieves the protocol version of the Store.
   * @return The protocol version of the Store.
   */
  function storeVersion() public pure returns (bytes32) {
    return STORE_VERSION;
  }
}
