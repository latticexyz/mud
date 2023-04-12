// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { QueryType } from "./Query.sol";
import { IUint256Component } from "./IUint256Component.sol";

// For ProxyRead and ProxyExpand QueryFragments:
// - component must be a component whose raw value decodes to a single uint256
// - value must decode to a single uint256 represents the proxy depth
struct WorldQueryFragment {
  QueryType queryType;
  uint256 componentId;
  bytes value;
}

interface IWorld {
  function components() external view returns (IUint256Component);

  function systems() external view returns (IUint256Component);

  function registerComponent(address componentAddr, uint256 id) external;

  function getComponent(uint256 id) external view returns (address);

  function getComponentIdFromAddress(address componentAddr) external view returns (uint256);

  function registerSystem(address systemAddr, uint256 id) external;

  function registerComponentValueSet(address component, uint256 entity, bytes calldata data) external;

  function registerComponentValueSet(uint256 entity, bytes calldata data) external;

  function registerComponentValueRemoved(address component, uint256 entity) external;

  function registerComponentValueRemoved(uint256 entity) external;

  function getNumEntities() external view returns (uint256);

  function hasEntity(uint256 entity) external view returns (bool);

  function getUniqueEntityId() external view returns (uint256);

  function query(WorldQueryFragment[] calldata worldQueryFragments) external view returns (uint256[] memory);

  function init() external;
}
