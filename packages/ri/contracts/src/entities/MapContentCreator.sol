// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { World } from "solecs/World.sol";
import { console } from "forge-std/console.sol";

import { IContentCreator } from "./IContentCreator.sol";

import { UsingAppStorage } from "../utils/UsingAppStorage.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";
import { LibUtils } from "../libraries/LibUtils.sol";

import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { PositionComponent, Coord, ID as PositionComponentID } from "../components/PositionComponent.sol";
import { PersonaComponent, ID as PersonaComponentID } from "../components/PersonaComponent.sol";
import { EmbodiedSystemArgumentComponent, ID as EmbodiedSystemArgumentComponentID } from "../components/EmbodiedSystemArgumentComponent.sol";

import { CreateEntityFromPrototypeEmbodiedSystem } from "../embodied/CreateEntityFromPrototypeEmbodiedSystem.sol";

int32 constant MAP_MAIN = 25; //uint256(keccak256("ember.entities.mapMain"));

contract MapContentCreator is UsingAppStorage, IContentCreator {
  function createContent() external override {
    AppStorage storage s = getAppStorage();
    World world = s.world;

    PositionComponent positionComponent = PositionComponent(world.getComponent(PositionComponentID));
    EntityTypeComponent entityTypeComponent = EntityTypeComponent(world.getComponent(EntityTypeComponentID));

    // Create Entities in Map
    int32 size = 7;
    for (int32 x = 0; x <= size; x++) {
      for (int32 y = 0; y <= size; y++) {
        if (x == 0 || y == 0 || x == size || y == size) {
          uint256 id = world.getUniqueEntityId();
          positionComponent.set(id, Coord(x, y));
          entityTypeComponent.set(id, 1);
        }
      }
    }
  }
}
