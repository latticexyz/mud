// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { RegistrationSystem } from "./RegistrationSystem.sol";

import { Call } from "../../Call.sol";
import { ROOT_NAMESPACE } from "../../constants.sol";
import { WithMsgSender } from "../../WithMsgSender.sol";
import { Resource } from "../../types.sol";

import { IModule } from "../../interfaces/IModule.sol";

import { ResourceType } from "./tables/ResourceType.sol";
import { SystemRegistry } from "./tables/SystemRegistry.sol";

/**
 * The RegistrationModule installs the RegistrationSystem
 * and all required tables and function selectors in the World.

 * Note:
 * This module is required to be delegatecalled via `World.registerRootSystem`,
 * because otherwise the registration of tables would require the `registerTable`
 * function selector to already exist on the World, but it is only
 * added in this module.
 */
contract RegistrationModule is IModule, WithMsgSender {
  error RegistrationModule_OnlyRoot();

  // Since the RegistrationSystem only exists once per World and writes to
  // known tables, we can deploy it once and register it in multiple Worlds.
  address immutable registrationSystem = address(new RegistrationSystem());
  bytes16 immutable registrationSystemFile = bytes16("registration");

  // The RegistrationModule can only be installed once per World, and is always installed in the root namespace.
  // Therefore the `namespace` argument is not needed.
  function install(bytes16) public {
    // Register tables that are relevant for the RegistrationSystem
    // Note: This only works if the RegistrationModule is delegatecalled and therefore the StoreCore library
    // is used directly to register the tables, because the `registerTable` function is not registered yet in the World
    // before this module is installed.

    SystemRegistry.registerSchema();
    SystemRegistry.setMetadata();

    ResourceType.registerSchema();
    ResourceType.setMetadata();

    // Bootstap by setting the ROOT_NAMESPACE resource type to NAMESPACE
    ResourceType.set(ROOT_NAMESPACE, Resource.NAMESPACE);

    // When this module is installed, the `registerSystem` function is not registered in the World yet.
    // But we can delegatecall the RegistrationSystem's `registerSystem` function directly.
    // a) If this module was delegatecalled, it is as if the `registerSystem` function was delegatecalled from the World.
    // b) If this module was called, in `registerSystem` msg.sender stays the World and _msgSender stays the original caller
    //   (case b is only for illustration purposes, as this module has to be installed as a root system and therefore is always delegatecalled)
    Call.withSender({
      msgSender: _msgSender(),
      target: registrationSystem,
      delegate: true,
      funcSelectorAndArgs: abi.encodeWithSelector(
        RegistrationSystem.registerSystem.selector,
        ROOT_NAMESPACE,
        registrationSystemFile,
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

    // As above, we have to delegatecall the RegistrationSystem directly
    // because the function selectors are not registered on the World yet.
    for (uint256 i = 0; i < rootFunctionSelectors.length; i++) {
      // console.log("Register function selector");
      // console.logBytes4(rootFunctionSelectors[i]);
      Call.withSender({
        msgSender: _msgSender(),
        target: registrationSystem,
        delegate: true,
        funcSelectorAndArgs: abi.encodeWithSelector(
          RegistrationSystem.registerRootFunctionSelector.selector,
          ROOT_NAMESPACE,
          registrationSystemFile,
          rootFunctionSelectors[i], // Use the same function selector for the World as in RegistrationSystem
          rootFunctionSelectors[i]
        )
      });
    }
  }
}
