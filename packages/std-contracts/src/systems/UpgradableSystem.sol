// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/PayableSystem.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById } from "solecs/utils.sol";
import { AddressBareComponent } from "../components/AddressBareComponent.sol";

uint256 constant ID = uint256(keccak256("system.Upgradable"));

contract UpgradableSystem is PayableSystem {
  address implementation;

  constructor(IWorld _world, address _components) PayableSystem(_world, _components) {}

  function execute(bytes memory args) public payable returns (bytes memory) {
    (bool success, bytes memory returndata) = implementation.delegatecall(
      bytes.concat(IPayableSystem.execute.selector, args)
    );
    if (!success) revert("delegate call failed");
    return returndata;
  }

  function upgrade(address impl) public onlyOwner {
    implementation = impl;
  }
}
