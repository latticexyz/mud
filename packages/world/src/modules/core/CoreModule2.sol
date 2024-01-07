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
import { CoreSystem2 } from "./CoreSystem2.sol";
import { CORE_MODULE_NAME, CORE_MODULE_2_NAME, CORE_SYSTEM_ID, CORE_SYSTEM_2_ID } from "./constants.sol";

import { Systems } from "../../codegen/tables/Systems.sol";
import { FunctionSelectors } from "../../codegen/tables/FunctionSelectors.sol";
import { FunctionSignatures } from "../../codegen/tables/FunctionSignatures.sol";
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
 * @title Core Module 2
 * @notice Registers internal World tables, the CoreSystem, and its function selectors.
 * @dev This module only supports `installRoot` because it installs root tables, systems and function selectors.
 */

contract CoreModule2 is Module {
  /**
   * @dev Since the CoreSystem only exists once per World and writes to
   * known tables, we can deploy it once and register it in multiple Worlds.
   */
  address immutable coreSystem2 = address(new CoreSystem2());

  /**
   * @notice Get the name of the module.
   * @return Module name as bytes16.
   */
  function getName() public pure returns (bytes16) {
    return CORE_MODULE_2_NAME;
  }

  /**
   * @notice Root installation of the module.
   * @dev Registers core tables, systems, and function selectors in the World.
   */
  function installRoot(bytes memory) public override {
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
   * @notice Register the CoreSystem2 in the World.
   * @dev Uses the CoreSystem2's `registerSystem` implementation to register itself on the World.
   */
  function _registerCoreSystem() internal {
    (address coreSystem, ) = Systems.get(CORE_SYSTEM_ID);
    WorldContextProviderLib.delegatecallWithContextOrRevert({
      msgSender: _msgSender(),
      msgValue: 0,
      target: coreSystem,
      callData: abi.encodeCall(
        WorldRegistrationSystem.registerSystem,
        (CORE_SYSTEM_2_ID, CoreSystem2(coreSystem2), true)
      )
    });
  }

  /**
   * @notice Register function selectors for all CoreSystem2 functions in the World.
   * @dev Iterates through known function signatures and registers them.
   */
  function _registerFunctionSelectors() internal {
    (address coreSystem, ) = Systems.get(CORE_SYSTEM_ID);

    string[4] memory functionSignatures = [
      // --- BalanceTransferSystem ---
      "transferBalanceToNamespace(bytes32,bytes32,uint256)",
      "transferBalanceToAddress(bytes32,address,uint256)",
      // --- BatchCallSystem ---
      "batchCall((bytes32,bytes)[])",
      "batchCallFrom((address,bytes32,bytes)[])"
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
          (CORE_SYSTEM_2_ID, functionSignatures[i], bytes4(keccak256(bytes(functionSignatures[i]))))
        )
      });
    }
  }
}
