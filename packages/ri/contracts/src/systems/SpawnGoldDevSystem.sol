pragma solidity >=0.8.0;
import "solecs/System.sol";

import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById } from "solecs/utils.sol";
import { LibQuery } from "solecs/LibQuery.sol";

import { LibPrototype } from "../libraries/LibPrototype.sol";
import { LibInventory } from "../libraries/LibInventory.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";

import { ID as GoldID } from "../prototypes/GoldPrototype.sol";

uint256 constant ID = uint256(keccak256("ember.system.spawnGoldDev"));

contract SpawnGoldDevSystem is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function requirement(bytes memory) public view returns (bytes memory) {
    // NOTE: Make sure to not include this system in a production deployment, as anyone can change all component values
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    Coord memory targetPosition = abi.decode(arguments, (Coord));
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));

    uint256 containerEntity = LibInventory.createContainer(components, world, 1);
    positionComponent.set(containerEntity, targetPosition);

    uint256 goldEntity = LibPrototype.copyPrototype(components, world, GoldID);
    ownedByComponent.set(goldEntity, containerEntity);
  }

  function executeTyped(Coord memory targetPosition) public returns (bytes memory) {
    return execute(abi.encode(targetPosition));
  }
}
