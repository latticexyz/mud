// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { STORE_VERSION } from "@latticexyz/store/src/version.sol";
import { IStoreEvents } from "@latticexyz/store/src/IStoreEvents.sol";
import { WORLD_VERSION } from "./version.sol";
import { IWorldEvents } from "./IWorldEvents.sol";
import { AccessControl } from "./AccessControl.sol";
import { ROOT_NAMESPACE_ID } from "./constants.sol";
import { Proxy } from "./Proxy.sol";
import { IERC1967 } from "./IERC1967.sol";
import { StorageSlot } from "./StorageSlot.sol";

/**
 * @dev Storage slot with the address of the current implementation.
 * This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1.
 */
bytes32 constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

/**
 * @dev Stores a new address in the EIP1967 implementation slot.
 */
function _setImplementation(address newImplementation) {
  StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value = newImplementation;

  emit IERC1967.Upgraded(newImplementation);
}

/**
 * @title World Proxy Contract
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This contract is a proxy that uses a World contract as an implementation.
 */
contract WorldProxy is Proxy {
  address public creator;

  /**
   * @notice Constructs the World Proxy.
   * @dev Mimics the behaviour of the StoreKernel and World constructors.
   */
  constructor(address implementation) {
    _setImplementation(implementation);

    StoreCore.initialize();
    emit IStoreEvents.HelloStore(STORE_VERSION);

    creator = msg.sender;
    emit IWorldEvents.HelloWorld(WORLD_VERSION);
  }

  /**
   * @dev Stores a new address in the EIP1967 implementation slot.
   */
  function setImplementation(address newImplementation) public {
    AccessControl.requireOwner(ROOT_NAMESPACE_ID, msg.sender);

    _setImplementation(newImplementation);
  }

  /**
   * @dev Returns the current implementation address.
   *
   * TIP: To get this value clients can read directly from the storage slot shown below (specified by EIP1967) using
   * the https://eth.wiki/json-rpc/API#eth_getstorageat[`eth_getStorageAt`] RPC call.
   * `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`
   */
  function _implementation() internal view virtual override returns (address) {
    return StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value;
  }
}
