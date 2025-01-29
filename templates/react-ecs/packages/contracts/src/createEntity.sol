// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Entity } from "./Entity.sol";
import { EntityCount } from "./codegen/tables/EntityCount.sol";

function createEntity() returns (Entity entity) {
  uint256 next = EntityCount.get() + 1;
  EntityCount.set(next);
  return Entity.wrap(bytes32(next));
}
