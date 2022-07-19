// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { addressToEntity } from "solecs/utils.sol";
import { getAddressById, getComponentById, addressToEntity, getSystemAddressById } from "solecs/utils.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

import { PlayerComponent, ID as PlayerComponentID } from "../components/PlayerComponent.sol";
import { DeathComponent, ID as DeathComponentID } from "../components/DeathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";

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

  function isOwnedByCaller(IUint256Component components, uint256 entityID) internal view returns (bool) {
    // Resolve the owned by chain and check if the msg.sender is part of it
    uint256 ownerEntity = resolveRelationshipChain(
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      entityID
    );
    if (
      addressToEntity(msg.sender) == ownerEntity &&
      PlayerComponent(getAddressById(components, PlayerComponentID)).has(ownerEntity) &&
      !DeathComponent(getAddressById(components, DeathComponentID)).has(ownerEntity)
    ) {
      return true;
    }

    // msg.sender is not part of the ownedByComponent relationship chain
    return false;
  }
}
