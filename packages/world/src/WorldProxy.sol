// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { STORE_VERSION } from "@latticexyz/store/src/version.sol";
import { IStoreEvents } from "@latticexyz/store/src/IStoreEvents.sol";
import { WORLD_VERSION } from "./version.sol";
import { IWorldEvents } from "./IWorldEvents.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract WorldProxy is ERC1967Proxy {
  address public creator;

  constructor(address implementation, bytes memory _data) ERC1967Proxy(implementation, _data) {
    StoreCore.initialize();
    emit IStoreEvents.HelloStore(STORE_VERSION);

    creator = msg.sender;
    emit IWorldEvents.HelloWorld(WORLD_VERSION);
  }
}
