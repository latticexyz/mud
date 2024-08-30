// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStore } from "@latticexyz/Store/src/IStore.sol";
import { StoreRead } from "@latticexyz/Store/src/StoreRead.sol";
import { StoreCore } from "@latticexyz/Store/src/StoreCore.sol";
import { STORE_VERSION } from "@latticexyz/Store/src/version.sol";
import { StoreKernel } from "@latticexyz/Store/src/StoreKernel.sol";
import { IStoreEvents } from "@latticexyz/Store/src/IStoreEvents.sol";

/**
 * @title Store Contract
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This contract integrates the core storage functionalities and provides an interface for data storage.
 * @dev This abstract contract initializes `StoreCore`, implements `storeVersion`, and read methods,
 * but not write methods.
 */
abstract contract Store is IStore, StoreKernel {}
