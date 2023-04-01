// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "../../System.sol";

import { UniqueEntity } from "./tables/UniqueEntity.sol";

import { NAMESPACE, TABLE_NAME } from "./constants.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

contract UniqueEntitySystem is System {
  /**
   * Increment and get an entity nonce.
   */
  function getUniqueEntity() public virtual returns (bytes32) {
    uint256 tableId = uint256(ResourceSelector.from(NAMESPACE, TABLE_NAME));
    uint256 uniqueEntity = UniqueEntity.get(tableId) + 1;
    UniqueEntity.set(tableId, uniqueEntity);

    return bytes32(uniqueEntity);
  }
}
