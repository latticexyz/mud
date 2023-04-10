// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreDynamicPartial } from "@latticexyz/store/src/IStoreDynamicPartial.sol";
import { IWorldDynamicPartial } from "../../interfaces/IWorldDynamicPartial.sol";

import { DynamicPartialSystem } from "./DynamicPartialSystem.sol";

import { Call } from "../../Call.sol";
import { ROOT_NAMESPACE, DYNAMIC_PARTIAL_MODULE_NAME, CORE_MODULE_NAME, REGISTRATION_MODULE_NAME, DYNAMIC_PARTIAL_SYSTEM_NAME } from "../../constants.sol";
import { WorldContext } from "../../WorldContext.sol";
import { Resource } from "../../Types.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { InstalledModules } from "../../tables/InstalledModules.sol";

// needed for its function selector
import { RegistrationSystem } from "../registration/RegistrationSystem.sol";

/**
 * DynamicPartialModule installs DynamicPartialSystem
 * and all its function selectors in the World.
 *
 * Note:
 * This module is required to be delegatecalled via `installRootModule`
 * to have access to the root namespace.
 */
contract DynamicPartialModule is IModule, WorldContext {
  using ResourceSelector for bytes32;

  // Since the DynamicPartialSystem only exists once per World and writes to
  // known tables, we can deploy it once and register it in multiple Worlds.
  DynamicPartialSystem immutable dynamicPartialSystem = new DynamicPartialSystem();

  function getName() public pure returns (bytes16) {
    return DYNAMIC_PARTIAL_MODULE_NAME;
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    // Require CoreModule and RegistrationModule to be installed in the root namespace
    if (InstalledModules.get(CORE_MODULE_NAME, keccak256(new bytes(0))).moduleAddress == address(0)) {
      revert RequiredModuleNotFound(ResourceSelector.from(ROOT_NAMESPACE, CORE_MODULE_NAME).toString());
    }
    if (InstalledModules.get(REGISTRATION_MODULE_NAME, keccak256(new bytes(0))).moduleAddress == address(0)) {
      revert RequiredModuleNotFound(ResourceSelector.from(ROOT_NAMESPACE, REGISTRATION_MODULE_NAME).toString());
    }

    Call.withSender({
      msgSender: _msgSender(),
      target: address(world),
      delegate: true,
      value: 0,
      funcSelectorAndArgs: abi.encodeWithSelector(
        RegistrationSystem.registerSystem.selector,
        ROOT_NAMESPACE,
        DYNAMIC_PARTIAL_SYSTEM_NAME,
        dynamicPartialSystem,
        true
      )
    });

    // Register root function selectors for the DynamicPartialModule in the World
    bytes4[4] memory rootFunctionSelectors = [
      IStoreDynamicPartial.pushToField.selector,
      IStoreDynamicPartial.updateInField.selector,
      IWorldDynamicPartial.pushToField.selector,
      IWorldDynamicPartial.updateInField.selector
    ];

    // Delegatecall the RegistrationSystem and pass on the original _msgSender() value.
    // This is required because modules don't have access to namespaces
    // TODO namespaces for modules? (or in this case of a root module, namespaces for world itself)
    for (uint256 i = 0; i < rootFunctionSelectors.length; i++) {
      Call.withSender({
        msgSender: _msgSender(),
        target: address(world),
        delegate: true,
        value: 0,
        funcSelectorAndArgs: abi.encodeWithSelector(
          RegistrationSystem.registerRootFunctionSelector.selector,
          ROOT_NAMESPACE,
          DYNAMIC_PARTIAL_SYSTEM_NAME,
          rootFunctionSelectors[i], // Use the same function selector for the World as in DynamicPartialSystem
          rootFunctionSelectors[i]
        )
      });
    }
  }
}
