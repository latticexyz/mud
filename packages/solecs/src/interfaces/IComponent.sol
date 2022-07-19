// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "./IOwned.sol";

interface IComponent is IOwned {
  function transferOwnership(address newOwner) external;

  function set(uint256 entity, bytes memory value) external;

  function remove(uint256 entity) external;

  function has(uint256 entity) external view returns (bool);

  function getRawValue(uint256 entity) external view returns (bytes memory);

  function getEntities() external view returns (uint256[] memory);

  function getEntitiesWithValue(bytes memory value) external view returns (uint256[] memory);
}
