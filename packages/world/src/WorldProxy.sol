// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { STORE_VERSION } from "@latticexyz/store/src/version.sol";
import { IStoreEvents } from "@latticexyz/store/src/IStoreEvents.sol";
import { WORLD_VERSION } from "./version.sol";
import { IWorldEvents } from "./IWorldEvents.sol";
import { AccessControl } from "./AccessControl.sol";
import { ROOT_NAMESPACE_ID } from "./constants.sol";
import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { ERC1967Utils } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";

contract WorldProxy is Proxy {
  address public creator;

  constructor(address implementation, bytes memory _data) payable {
    ERC1967Utils.upgradeToAndCall(implementation, _data);

    StoreCore.initialize();
    emit IStoreEvents.HelloStore(STORE_VERSION);

    creator = msg.sender;
    emit IWorldEvents.HelloWorld(WORLD_VERSION);
  }

  function setImplementation(address newImplementation) public {
    AccessControl.requireOwner(ROOT_NAMESPACE_ID, msg.sender);

    ERC1967Utils.upgradeToAndCall(newImplementation, new bytes(0));
  }

  /**
   * @dev Returns the current implementation address.
   *
   * TIP: To get this value clients can read directly from the storage slot shown below (specified by EIP1967) using
   * the https://eth.wiki/json-rpc/API#eth_getstorageat[`eth_getStorageAt`] RPC call.
   * `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`
   */
  function _implementation() internal view virtual override returns (address) {
    return ERC1967Utils.getImplementation();
  }
}
