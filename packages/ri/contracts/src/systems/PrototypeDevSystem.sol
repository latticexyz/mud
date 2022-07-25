// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById } from "solecs/utils.sol";
import { LibPrototype } from "../libraries/LibPrototype.sol";

uint256 constant ID = uint256(keccak256("mudwar.system.PrototypeDev"));

contract PrototypeDevSystem is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function requirement(bytes memory) public view returns (bytes memory) {
    // NOTE: Make sure to not include this system in a production deployment, as anyone can change all component values
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 prototypeId, uint256 entity) = abi.decode(arguments, (uint256, uint256));
    LibPrototype.copyPrototypeOnEntity(components, world, prototypeId, entity);
  }

  function executeTyped(uint256 prototypeId, uint256 entity) public returns (bytes memory) {
    return execute(abi.encode(prototypeId, entity));
  }
}
