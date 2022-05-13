// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

interface IEntityContainer {
  function has(uint256 entity) external view returns (bool);

  function getEntities() external view returns (uint256[] memory);

  function getEntitiesWithValue(bytes memory value) external view returns (uint256[] memory);
}
