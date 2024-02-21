import { formatAndWriteSolidity, renderedSolidityHeader } from "@latticexyz/common/codegen";
import { getSrcDirectory } from "@latticexyz/common/foundry";
import path from "path";

export function renderInitModule(systems: { variable: string; contract: string; id: string }[]) {
  return `
  ${renderedSolidityHeader}

import { System } from "../../System.sol";
import { WorldContextProviderLib } from "../../WorldContext.sol";
import { ROOT_NAMESPACE_ID, STORE_NAMESPACE_ID, WORLD_NAMESPACE_ID } from "../../constants.sol";
import { Module } from "../../Module.sol";

import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

import { NamespaceOwner } from "../../codegen/tables/NamespaceOwner.sol";
import { ResourceAccess } from "../../codegen/tables/ResourceAccess.sol";
import { InstalledModules } from "../../codegen/tables/InstalledModules.sol";
import { UserDelegationControl } from "../../codegen/tables/UserDelegationControl.sol";
import { NamespaceDelegationControl } from "../../codegen/tables/NamespaceDelegationControl.sol";

import { AccessManagementSystem } from "./implementations/AccessManagementSystem.sol";
import { BalanceTransferSystem } from "./implementations/BalanceTransferSystem.sol";
import { BatchCallSystem } from "./implementations/BatchCallSystem.sol";

import { RegistrationSystem } from "./RegistrationSystem.sol";
import { ${systems.map((system) => system.id).join(",")} } from "./constants.sol";

import { Systems } from "../../codegen/tables/Systems.sol";
import { FunctionSelectors } from "../../codegen/tables/FunctionSelectors.sol";
import { FunctionSignatures } from "../../codegen/tables/FunctionSignatures.sol";
import { SystemHooks } from "../../codegen/tables/SystemHooks.sol";
import { SystemRegistry } from "../../codegen/tables/SystemRegistry.sol";
import { InitModuleAddress } from "../../codegen/tables/InitModuleAddress.sol";
import { Balances } from "../../codegen/tables/Balances.sol";

import { WorldRegistrationSystem } from "./implementations/WorldRegistrationSystem.sol";

/**
 * @title Init Module
 * @notice Registers internal World tables, systems, and their function selectors.
 * @dev This module only supports installRoot because it installs root tables, systems and function selectors.
 */

contract InitModule is Module {
  ${systems.map((system) => `address internal immutable ${system.variable}`).join(";")}; 

  constructor(
    ${systems.map((system) => `${system.contract} _${system.variable}`).join(",")} 
  ) {
    ${systems.map((system) => `${system.variable} = address(_${system.variable})`).join(";")}; 
  }

  /**
   * @notice Root installation of the module.
   * @dev Registers core tables, systems, and function selectors in the World.
   */
  function installRoot(bytes memory) public override {
    _registerTables();
    _registerSystems();
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
   * @notice Register World's tables.
   * @dev This internal function registers various tables and sets initial permissions.
   */
  function _registerTables() internal {
    StoreCore.registerInternalTables();
    NamespaceOwner.register();
    Balances.register();
    InstalledModules.register();
    UserDelegationControl.register();
    NamespaceDelegationControl.register();
    ResourceAccess.register();
    Systems.register();
    FunctionSelectors.register();
    FunctionSignatures.register();
    SystemHooks.register();
    SystemRegistry.register();
    InitModuleAddress.register();

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
   * @notice Register the systems in the World.
   */
  function _registerSystems() internal {
    ${systems.map((system) => `_registerSystem(${system.variable}, ${system.id})`).join(";")}; 
  }

  /**
   * @notice Register the internal system in the World.
   * @dev Uses the WorldRegistrationSystem's registerSystem implementation to register the system on the World.
   */
  function _registerSystem(address target, ResourceId systemId) internal {
    WorldContextProviderLib.delegatecallWithContextOrRevert({
      msgSender: _msgSender(),
      msgValue: 0,
      target: registrationSystem,
      callData: abi.encodeCall(WorldRegistrationSystem.registerSystem, (systemId, System(target), true))
    });
  }

  /**
   * @notice Register function selectors for all core system functions in the World.
   * @dev Iterates through known function signatures and registers them.
   */
  function _registerFunctionSelectors() internal {
    string[4] memory functionSignaturesAccessManagement = [
      // --- AccessManagementSystem ---
      "grantAccess(bytes32,address)",
      "revokeAccess(bytes32,address)",
      "transferOwnership(bytes32,address)",
      "renounceOwnership(bytes32)"
    ];
    for (uint256 i = 0; i < functionSignaturesAccessManagement.length; i++) {
      _registerRootFunctionSelector(ACCESS_MANAGEMENT_SYSTEM_ID, functionSignaturesAccessManagement[i]);
    }

    string[2] memory functionSignaturesBalanceTransfer = [
      // --- BalanceTransferSystem ---
      "transferBalanceToNamespace(bytes32,bytes32,uint256)",
      "transferBalanceToAddress(bytes32,address,uint256)"
    ];
    for (uint256 i = 0; i < functionSignaturesBalanceTransfer.length; i++) {
      _registerRootFunctionSelector(BALANCE_TRANSFER_SYSTEM_ID, functionSignaturesBalanceTransfer[i]);
    }

    string[2] memory functionSignaturesBatchCall = [
      // --- BatchCallSystem ---
      "batchCall((bytes32,bytes)[])",
      "batchCallFrom((address,bytes32,bytes)[])"
    ];
    for (uint256 i = 0; i < functionSignaturesBatchCall.length; i++) {
      _registerRootFunctionSelector(BATCH_CALL_SYSTEM_ID, functionSignaturesBatchCall[i]);
    }

    string[14] memory functionSignaturesRegistration = [
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
      "unregisterDelegation(address)",
      "registerNamespaceDelegation(bytes32,bytes32,bytes)",
      "unregisterNamespaceDelegation(bytes32)"
    ];
    for (uint256 i = 0; i < functionSignaturesRegistration.length; i++) {
      _registerRootFunctionSelector(REGISTRATION_SYSTEM_ID, functionSignaturesRegistration[i]);
    }
  }

  /**
   * @notice Register the function selector in the World.
   * @dev Uses the RegistrationSystem's registerRootFunctionSelector to register the function selector.
   */
  function _registerRootFunctionSelector(ResourceId systemId, string memory functionSignature) internal {
    WorldContextProviderLib.delegatecallWithContextOrRevert({
      msgSender: _msgSender(),
      msgValue: 0,
      target: registrationSystem,
      callData: abi.encodeCall(
        WorldRegistrationSystem.registerRootFunctionSelector,
        (systemId, functionSignature, bytes4(keccak256(bytes(functionSignature))))
      )
    });
  }
}
`;
}

const output = renderInitModule([
  { variable: "accessManagementSystem", contract: "AccessManagementSystem", id: "ACCESS_MANAGEMENT_SYSTEM_ID" },
  { variable: "balanceTransferSystem", contract: "BalanceTransferSystem", id: "BALANCE_TRANSFER_SYSTEM_ID" },
  { variable: "batchCallSystem", contract: "BatchCallSystem", id: "BATCH_CALL_SYSTEM_ID" },
  { variable: "registrationSystem", contract: "RegistrationSystem", id: "REGISTRATION_SYSTEM_ID" },
]);

const srcDir = await getSrcDirectory();

formatAndWriteSolidity(output, path.join(srcDir, "modules/init/InitModule.sol"), "Generated init module file");
