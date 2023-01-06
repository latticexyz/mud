// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IUint256Component } from "../interfaces/IUint256Component.sol";
import { IWorld } from "../interfaces/IWorld.sol";
import { getSystemAddressById, getAddressById } from "../utils.sol";

library SystemStorage {
  struct Layout {
    IUint256Component components;
    IWorld world;
  }

  bytes32 internal constant STORAGE_SLOT = keccak256("solecs.contracts.storage.System");

  function layout() internal pure returns (Layout storage l) {
    bytes32 slot = STORAGE_SLOT;
    assembly {
      l.slot := slot
    }
  }

  function init(IWorld _world, IUint256Component _components) internal {
    Layout storage l = layout();
    l.world = _world;
    l.components = _components;
  }

  function components() public view returns (IUint256Component) {
    return layout().components;
  }

  function world() public view returns (IWorld) {
    return layout().world;
  }

  function system(uint256 systemID) internal view returns (address) {
    return getSystemAddressById(layout().components, systemID);
  }

  function component(uint256 componentID) internal view returns (address) {
    return getAddressById(layout().components, componentID);
  }
}
