// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";

import { Direction } from "./codegen/common.sol";
import { Owner } from "./codegen/tables/Owner.sol";
import { Position } from "./codegen/tables/Position.sol";
import { Entity } from "./Entity.sol";
import { createEntity } from "./createEntity.sol";

contract SpawnSystem is System {
  function spawn() public returns (Entity entity) {
    entity = createEntity();
    Owner.set(entity, _msgSender());
    Position.set(entity, 0, 0);
  }
}
