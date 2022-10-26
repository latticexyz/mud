// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById } from "solecs/utils.sol";
import { AddressBareComponent } from "../components/AddressBareComponent.sol";

uint256 constant ID = uint256(keccak256("system.Upgradable"));

contract UpgradableSystem is System {
  address implementation;

  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    (bool success, bytes memory returndata) = implementation.delegatecall(bytes.concat(ISystem.execute.selector, args));
    if (!success) revert("delegate call failed");
    return returndata;
  }

  function upgrade(address impl) public onlyOwner {
    implementation = impl;
  }
}
