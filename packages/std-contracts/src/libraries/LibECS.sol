pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import { addressToEntity } from "solecs/utils.sol";
import { Uint256Component } from "../components/Uint256Component.sol";

library LibECS {
  function resolveRelationshipChain(Uint256Component relationshipComponent, uint256 entityID)
    internal
    view
    returns (uint256)
  {
    while (relationshipComponent.has(entityID)) {
      entityID = relationshipComponent.getValue(entityID);
    }
    return entityID;
  }

  function isOwnedByCaller(Uint256Component ownedByComponent, uint256 entityID) internal view returns (bool) {
    // An entity has ownership over itself
    if (addressToEntity(msg.sender) == entityID) return true;

    // Resolve the owned by chain and check if the msg.sender is part of it
    while (ownedByComponent.has(entityID)) {
      entityID = ownedByComponent.getValue(entityID);
      if (addressToEntity(msg.sender) == entityID) return true;
    }

    // msg.sender is not part of the ownedByComponent relationship chain
    return false;
  }
}
