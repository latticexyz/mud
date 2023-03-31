// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { RegistrationSystem } from "./RegistrationSystem.sol";

import { Call } from "../../Call.sol";
import { ROOT_NAMESPACE, REGISTRATION_MODULE_NAME, CORE_MODULE_NAME, REGISTRATION_SYSTEM_NAME } from "../../constants.sol";
import { WorldContext } from "../../WorldContext.sol";
import { Resource } from "../../Types.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { IModule } from "../../interfaces/IModule.sol";

import { InstalledModules } from "../../tables/InstalledModules.sol";

import { ResourceType } from "./tables/ResourceType.sol";
import { SystemRegistry } from "./tables/SystemRegistry.sol";

/**
 * The RegistrationModule installs the RegistrationSystem
 * and all required tables and function selectors in the World.

 * Note:
 * This module is required to be delegatecalled via `World.registerRootSystem`.
 * because otherwise the table libraries would try to call methods on the World contract
 * that are only registered in this module (e.g. `registerTable`).
 * If the module is delegatecalled, the StoreCore functions are used directly.
 */
contract RegistrationModule is IModule, WorldContext {
  using ResourceSelector for bytes32;

  // Since the RegistrationSystem only exists once per World and writes to
  // known tables, we can deploy it once and register it in multiple Worlds.
  address immutable registrationSystem = address(new RegistrationSystem());

  function getName() public pure returns (bytes16) {
    return REGISTRATION_MODULE_NAME;
  }

  function install(bytes memory) public {
    // Require the CoreModule to be installed in the root namespace
    if (InstalledModules.get(CORE_MODULE_NAME, keccak256(new bytes(0))).moduleAddress == address(0)) {
      revert RequiredModuleNotFound(ResourceSelector.from(ROOT_NAMESPACE, CORE_MODULE_NAME).toString());
    }

    // Register tables required by RegistrationSystem
    SystemRegistry.registerSchema();
    SystemRegistry.setMetadata();
    ResourceType.registerSchema();
    ResourceType.setMetadata();

    // Set the ROOT_NAMESPACE resource type to NAMESPACE
    ResourceType.set(ROOT_NAMESPACE, Resource.NAMESPACE);

    // Delegatecall the RegistrationSystem and pass on the original _msgSender() value.
    // This is required because the `registerSystem` function selector is not registered in the World yet.
    Call.withSender({
      msgSender: _msgSender(),
      target: registrationSystem,
      delegate: true,
      funcSelectorAndArgs: abi.encodeWithSelector(
        RegistrationSystem.registerSystem.selector,
        ROOT_NAMESPACE,
        REGISTRATION_SYSTEM_NAME,
        registrationSystem,
        true
      )
    });

    // Register root function selectors for the RegistrationModule in the World
    bytes4[9] memory rootFunctionSelectors = [
      RegistrationSystem.registerNamespace.selector,
      RegistrationSystem.registerTable.selector,
      RegistrationSystem.setMetadata.selector,
      RegistrationSystem.registerHook.selector,
      RegistrationSystem.registerTableHook.selector,
      RegistrationSystem.registerSystemHook.selector,
      RegistrationSystem.registerSystem.selector,
      RegistrationSystem.registerFunctionSelector.selector,
      RegistrationSystem.registerRootFunctionSelector.selector
    ];

    // As above, delegatecall the RegistrationSystem directly because the
    // `registerRootFunctionSelector` method is not registered in the World yet.
    for (uint256 i = 0; i < rootFunctionSelectors.length; i++) {
      Call.withSender({
        msgSender: _msgSender(),
        target: registrationSystem,
        delegate: true,
        funcSelectorAndArgs: abi.encodeWithSelector(
          RegistrationSystem.registerRootFunctionSelector.selector,
          ROOT_NAMESPACE,
          REGISTRATION_SYSTEM_NAME,
          rootFunctionSelectors[i], // Use the same function selector for the World as in RegistrationSystem
          rootFunctionSelectors[i]
        )
      });
    }
  }
}
