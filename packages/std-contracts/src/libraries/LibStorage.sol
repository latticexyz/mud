// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getSystemAddressById, getAddressById } from "solecs/utils.sol";

uint256 constant worldID = uint256(keccak256("mud.world"));
uint256 constant componentsID = uint256(keccak256("mud.components"));

library LibStorage {
  function c() internal view returns (IUint256Component components) {
    bytes32 position = bytes32(componentsID);
    assembly {
      components := sload(position)
    }
  }

  function w() internal view returns (IWorld world) {
    bytes32 position = bytes32(worldID);
    assembly {
      world := sload(position)
    }
  }

  function storeAddress(uint256 position, address a) internal {
    bytes32 data = bytes32(uint256(uint160(a)));
    assembly {
      sstore(position, data)
    }
  }

  function sys(uint256 systemID) internal view returns (address) {
    return getSystemAddressById(c(), systemID);
  }

  function comp(uint256 componentID) internal view returns (address) {
    return getAddressById(c(), componentID);
  }
}
