// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { STORE_VERSION } from "@latticexyz/store/src/version.sol";
import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreRead } from "@latticexyz/store/src/StoreRead.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { IStoreEvents } from "@latticexyz/store/src/IStoreEvents.sol";
import { IStoreKernel } from "./IStoreKernel.sol";

/**
 * @title StoreKernel Contract
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This contract integrates the storage functionalities except registration and provides an interface for data storage.
 * @dev This abstract contract initializes `StoreCore`, implements `storeVersion`, and read methods.
 */
abstract contract StoreKernel is IStoreKernel {
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
