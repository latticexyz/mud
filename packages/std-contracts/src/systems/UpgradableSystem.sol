// SPDX-License-Identifier: MIT
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
    _delegate(implementation);
  }

  function upgrade(address impl) public onlyOwner {
    implementation = impl;
  }

  /**
   * From https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.7.3/contracts/proxy/Proxy.sol
   * @dev Delegates the current call to `implementation`.
   *
   * This function does not return to its internal call site, it will return directly to the external caller.
   */
  function _delegate(address impl) internal {
    assembly {
      // Copy msg.data. We take full control of memory in this inline assembly
      // block because it will not return to Solidity code. We overwrite the
      // Solidity scratch pad at memory position 0.
      calldatacopy(0, 0, calldatasize())

      // Call the implementation.
      // out and outsize are 0 because we don't know the size yet.
      let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)

      // Copy the returned data.
      returndatacopy(0, 0, returndatasize())

      switch result
      // delegatecall returns 0 on error.
      case 0 {
        revert(0, returndatasize())
      }
      default {
        return(0, returndatasize())
      }
    }
  }
}
