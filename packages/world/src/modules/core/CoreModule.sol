// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { WorldContextProviderLib } from "../../WorldContext.sol";
import { ROOT_NAMESPACE, ROOT_NAMESPACE_ID, STORE_NAMESPACE_ID, WORLD_NAMESPACE_ID } from "../../constants.sol";
import { Module } from "../../Module.sol";

import { IBaseWorld } from "../../codegen/interfaces/IBaseWorld.sol";

import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "../../WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "../../worldResourceTypes.sol";

import { NamespaceOwner } from "../../codegen/tables/NamespaceOwner.sol";
import { ResourceAccess } from "../../codegen/tables/ResourceAccess.sol";
import { InstalledModules } from "../../codegen/tables/InstalledModules.sol";
import { UserDelegationControl } from "../../codegen/tables/UserDelegationControl.sol";
import { NamespaceDelegationControl } from "../../codegen/tables/NamespaceDelegationControl.sol";

import { CoreSystem } from "./CoreSystem.sol";
import { CORE_MODULE_NAME, CORE_SYSTEM_ID } from "./constants.sol";

import { Systems } from "../../codegen/tables/Systems.sol";
import { FunctionSelectors } from "../../codegen/tables/FunctionSelectors.sol";
import { SystemHooks } from "../../codegen/tables/SystemHooks.sol";
import { SystemRegistry } from "../../codegen/tables/SystemRegistry.sol";
import { Balances } from "../../codegen/tables/Balances.sol";

import { AccessManagementSystem } from "./implementations/AccessManagementSystem.sol";
import { BalanceTransferSystem } from "./implementations/BalanceTransferSystem.sol";
import { BatchCallSystem } from "./implementations/BatchCallSystem.sol";
import { ModuleInstallationSystem } from "./implementations/ModuleInstallationSystem.sol";
import { StoreRegistrationSystem } from "./implementations/StoreRegistrationSystem.sol";
import { WorldRegistrationSystem } from "./implementations/WorldRegistrationSystem.sol";

/**
 * @title Core Module
 * @notice Registers internal World tables, the CoreSystem, and its function selectors.
 * @dev This module only supports `installRoot` because it installs root tables, systems and function selectors.
 */

contract CoreModule is Module {
  /**
   * @dev Since the CoreSystem only exists once per World and writes to
   * known tables, we can deploy it once and register it in multiple Worlds.
   */
  address immutable coreSystem = address(new CoreSystem());

  /**
   * @notice Get the name of the module.
   * @return Module name as bytes16.
   */
  function getName() public pure returns (bytes16) {
    return CORE_MODULE_NAME;
  }

  /**
   * @notice Root installation of the module.
   * @dev Registers core tables, systems, and function selectors in the World.
   */
  function installRoot(bytes memory) public override {
    _registerCoreTables();
    _registerCoreSystem();
    _registerFunctionSelectors();
  }

  /**
   * @notice Non-root installation of the module.
   * @dev Installation is only supported at root level, so this function will always revert.
   */
  function install(bytes memory) public pure {
    revert Module_NonRootInstallNotSupported();
  }

  /**
   * @notice Register core tables in the World.
   * @dev This internal function registers various tables and sets initial permissions.
   */
  function _registerCoreTables() internal {
    StoreCore.registerCoreTables();
    NamespaceOwner.register();
    Balances.register();
    InstalledModules.register();
    UserDelegationControl.register();
    NamespaceDelegationControl.register();
    ResourceAccess.register();
    Systems.register();
    FunctionSelectors.register();
    SystemHooks.register();
    SystemRegistry.register();

    ResourceIds._setExists(ROOT_NAMESPACE_ID, true);
    NamespaceOwner._set(ROOT_NAMESPACE_ID, _msgSender());
    ResourceAccess._set(ROOT_NAMESPACE_ID, _msgSender(), true);

    ResourceIds._setExists(STORE_NAMESPACE_ID, true);
    NamespaceOwner._set(STORE_NAMESPACE_ID, _msgSender());
    ResourceAccess._set(STORE_NAMESPACE_ID, _msgSender(), true);

    ResourceIds._setExists(WORLD_NAMESPACE_ID, true);
    NamespaceOwner._set(WORLD_NAMESPACE_ID, _msgSender());
    ResourceAccess._set(WORLD_NAMESPACE_ID, _msgSender(), true);
  }

  /**
   * @notice Register the CoreSystem in the World.
   * @dev Uses the CoreSystem's `registerSystem` implementation to register itself on the World.
   */
  function _registerCoreSystem() internal {
    WorldContextProviderLib.delegatecallWithContextOrRevert({
      msgSender: _msgSender(),
      msgValue: 0,
      target: coreSystem,
      callData: abi.encodeCall(WorldRegistrationSystem.registerSystem, (CORE_SYSTEM_ID, CoreSystem(coreSystem), true))
    });
  }

  /**
   * @notice Register function selectors for all CoreSystem functions in the World.
   * @dev Iterates through known function signatures and registers them.
   */
  function _registerFunctionSelectors() internal {
    string[19] memory functionSignatures = [
      // --- AccessManagementSystem ---
      "grantAccess(bytes32,address)",
      "revokeAccess(bytes32,address)",
      "transferOwnership(bytes32,address)",
      // --- BalanceTransferSystem ---
      "transferBalanceToNamespace(bytes32,bytes32,uint256)",
      "transferBalanceToAddress(bytes32,address,uint256)",
      // --- BatchCallSystem ---
      "batchCall((bytes32,bytes)[])",
      "batchCallFrom((address,bytes32,bytes)[])",
      // --- ModuleInstallationSystem ---
      "installModule(address,bytes)",
      // --- StoreRegistrationSystem ---
      "registerTable(bytes32,bytes32,bytes32,bytes32,string[],string[])",
      "registerStoreHook(bytes32,address,uint8)",
      "unregisterStoreHook(bytes32,address)",
      // --- WorldRegistrationSystem ---
      "registerNamespace(bytes32)",
      "registerSystemHook(bytes32,address,uint8)",
      "unregisterSystemHook(bytes32,address)",
      "registerSystem(bytes32,address,bool)",
      "registerFunctionSelector(bytes32,string)",
      "registerRootFunctionSelector(bytes32,string,bytes4)",
      "registerDelegation(address,bytes32,bytes)",
      "registerNamespaceDelegation(bytes32,bytes32,bytes)"
    ];

    for (uint256 i = 0; i < functionSignatures.length; i++) {
      // Use the CoreSystem's `registerRootFunctionSelector` to register the
      // root function selectors in the World.
      WorldContextProviderLib.delegatecallWithContextOrRevert({
        msgSender: _msgSender(),
        msgValue: 0,
        target: coreSystem,
        callData: abi.encodeCall(
          WorldRegistrationSystem.registerRootFunctionSelector,
          (CORE_SYSTEM_ID, functionSignatures[i], bytes4(keccak256(bytes(functionSignatures[i]))))
        )
      });
    }
  }
}
