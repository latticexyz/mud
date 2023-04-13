// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreCold } from "@latticexyz/store/src/IStore.sol";
import { IWorldCold, IWorldCold_grantAccessWithName } from "../../interfaces/IWorldCold.sol";

import { ColdMethodsSystem } from "./ColdMethodsSystem.sol";

import { ROOT_NAMESPACE, COLD_METHODS_MODULE_NAME, CORE_MODULE_NAME, REGISTRATION_MODULE_NAME, COLD_METHODS_SYSTEM_NAME } from "../../constants.sol";
import { WorldContext } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { InstalledModules } from "../../tables/InstalledModules.sol";

/**
 * ColdMethodsModule installs ColdMethodsSystem
 * and all its function selectors in the World.
 *
 * Note:
 * This module is required to be delegatecalled via `installRootModule`
 * to have access to the root namespace.
 */
contract ColdMethodsModule is IModule, WorldContext {
  using ResourceSelector for bytes32;

  // Since the ColdMethodsSystem only exists once per World and writes to
  // known tables, we can deploy it once and register it in multiple Worlds.
  ColdMethodsSystem immutable coldMethodsSystem = new ColdMethodsSystem();

  function getName() public pure returns (bytes16) {
    return COLD_METHODS_MODULE_NAME;
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

    world.registerSystem(ROOT_NAMESPACE, COLD_METHODS_SYSTEM_NAME, coldMethodsSystem, true);

    // Register root function selectors for the ColdMethodsModule in the World
    bytes4[7] memory rootFunctionSelectors = [
      IStoreCold.registerSchema.selector,
      IStoreCold.setMetadata.selector,
      IStoreCold.registerStoreHook.selector,
      IWorldCold.installModule.selector,
      IWorldCold.grantAccess.selector,
      IWorldCold_grantAccessWithName.grantAccess.selector,
      IWorldCold.retractAccess.selector
    ];

    for (uint256 i = 0; i < rootFunctionSelectors.length; i++) {
      world.registerRootFunctionSelector(
        ROOT_NAMESPACE,
        COLD_METHODS_SYSTEM_NAME,
        rootFunctionSelectors[i], // Use the same function selector for the World as in ColdMethodsSystem
        rootFunctionSelectors[i]
      );
    }
  }
}
