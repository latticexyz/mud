// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "./interfaces/IUint256Component.sol";
import { IWorld } from "./interfaces/IWorld.sol";
import { getSystemAddressById, getAddressById } from "./utils.sol";

/**
  This library provides a utility to access the addresses of the components registry
  and the world directly. 

  It relies on the invariant that the base System class declares components as the first state variable
  and the world as the second one.

  This enables a direct storage read based on the layout of storage in Solidity
  https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html#layout-of-state-variables-in-storage

  DO NOT change the order of the base System variables.
  DO NOT add a variable before the components and world in the base System.
 */

library LibStorage {
  function c() internal view returns (IUint256Component components) {
    assembly {
      components := sload(0)
    }
  }

  function w() internal view returns (IWorld world) {
    assembly {
      world := sload(1)
    }
  }

  function sys(uint256 systemID) internal view returns (address) {
    return getSystemAddressById(c(), systemID);
  }

  function comp(uint256 componentID) internal view returns (address) {
    return getAddressById(c(), componentID);
  }
}
