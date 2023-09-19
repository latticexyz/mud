// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "../../System.sol";

import { UniqueEntity } from "./tables/UniqueEntity.sol";

import { TABLE_ID } from "./constants.sol";
import { ResourceId, WorldResourceIdInstance } from "../../WorldResourceId.sol";

contract UniqueEntitySystem is System {
  /**
   * Increment and get an entity nonce.
   */
  function getUniqueEntity() public virtual returns (bytes32) {
    uint256 uniqueEntity = UniqueEntity.get(TABLE_ID) + 1;
    UniqueEntity.set(TABLE_ID, uniqueEntity);

    return bytes32(uniqueEntity);
  }
}
