// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IUint256Component } from "./interfaces/IUint256Component.sol";
import { IWorld } from "./interfaces/IWorld.sol";
import { getSystemAddressById, getAddressById } from "./utils.sol";

/**
 * Systems contain the address of the components registry and world contract as state variables.
 * SystemStorage ensures that these addresses are stored at deterministic locations in a System contract's storage.
 * Developers can read/write components and access world utilities from any library called by a System.
 * Warning: Library must be initialized (init) by a contract that can access components + world contracts before use.
 * The intialization is done automatically for any contract inheriting System or MudTest.
 */
library SystemStorage {
  /** Data that the system stores */
  struct Layout {
    IUint256Component components;
    IWorld world;
  }

  /** Location in memory where the Layout struct will be stored */
  bytes32 internal constant STORAGE_SLOT = keccak256("solecs.contracts.storage.System");

  /**
   * Utility for accessing the STORAGE_SLOT location in the contract's storage
   * @return Layout struct at storage position l
   */
  function layout() internal pure returns (Layout storage l) {
    bytes32 slot = STORAGE_SLOT;
    assembly {
      l.slot := slot
    }
  }

  /**
   * Register this component in the given world.
   * @param _world Address of the World contract.
   * @param _components Address of the Components registry contract.
   * @dev This function must be called at the start of any contract that expects libraries to access SystemStorage!
   */
  function init(IWorld _world, IUint256Component _components) internal {
    Layout storage l = layout();
    l.world = _world;
    l.components = _components;
  }

  /**
   * @return Component registry contract
   */
  function components() public view returns (IUint256Component) {
    return layout().components;
  }

  /**
   * @return World contract
   */
  function world() public view returns (IWorld) {
    return layout().world;
  }

  /**
   * @param systemID ID for a system
   * @return address of the System contract from the components registry
   */
  function system(uint256 systemID) internal view returns (address) {
    return getSystemAddressById(layout().components, systemID);
  }

  /**
   * @param componentID ID for a component
   * @return address of the Component contract from the components registry
   */
  function component(uint256 componentID) internal view returns (address) {
    return getAddressById(layout().components, componentID);
  }
}
