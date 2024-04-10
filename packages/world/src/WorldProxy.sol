// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { STORE_VERSION } from "@latticexyz/store/src/version.sol";
import { IStoreEvents } from "@latticexyz/store/src/IStoreEvents.sol";
import { WORLD_VERSION } from "./version.sol";
import { IWorldEvents } from "./IWorldEvents.sol";
import { AccessControl } from "./AccessControl.sol";
import { ROOT_NAMESPACE_ID } from "./constants.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { ERC1967Utils } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";

contract WorldProxy is ERC1967Proxy {
  address public creator;

  constructor(address implementation, bytes memory _data) ERC1967Proxy(implementation, _data) {
    StoreCore.initialize();
    emit IStoreEvents.HelloStore(STORE_VERSION);

    creator = msg.sender;
    emit IWorldEvents.HelloWorld(WORLD_VERSION);
  }

  function setImplementation(address newImplementation) public {
    AccessControl.requireOwner(ROOT_NAMESPACE_ID, msg.sender);

    ERC1967Utils.upgradeToAndCall(newImplementation, new bytes(0));
  }
}
