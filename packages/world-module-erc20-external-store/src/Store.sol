// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// import { STORE_VERSION } from "./version.sol";
// import { IStore } from "./IStore.sol";
// import { StoreKernel } from "./StoreKernel.sol";
// import { StoreRead } from "./StoreRead.sol";
// import { StoreCore } from "./StoreCore.sol";
// import { IStoreEvents } from "./IStoreEvents.sol";

/**
 * @title Store Contract
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This contract integrates the core storage functionalities and provides an interface for data storage.
 * @dev This abstract contract initializes `StoreCore`, implements `storeVersion`, and read methods,
 * but not write methods.
 */
abstract contract Store is IStore, StoreKernel {}
