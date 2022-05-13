// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IEntityContainer } from './IEntityContainer.sol';

interface IEntityIndexer is IEntityContainer {
  function update(uint256 entity, bytes memory value) external;

  function remove(uint256 entity) external;
}
