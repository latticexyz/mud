// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IModule, MODULE_INTERFACE_ID } from "../../../IModule.sol";
import { System } from "../../../System.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { WorldContextProviderLib } from "../../../WorldContext.sol";
import { ResourceAccess } from "../../../codegen/tables/ResourceAccess.sol";
import { InstalledModules } from "../../../codegen/tables/InstalledModules.sol";
import { requireInterface } from "../../../requireInterface.sol";

/**
 * @title Module Installation System
 * @dev A system contract to handle the installation of (non-root) modules in the World.
 */
contract ModuleInstallationSystem is System {
  /**
   * @notice Installs a module into the World under a specified namespace.
   * @dev Validates the given module against the IModule interface and delegates the installation process.
   * The module is then registered in the InstalledModules table.
   * @param module The module to be installed.
   * @param args Arguments for the module installation.
   */
  function installModule(IModule module, bytes memory args) public {
    // Require the provided address to implement the IModule interface
    requireInterface(address(module), MODULE_INTERFACE_ID);

    WorldContextProviderLib.callWithContextOrRevert({
      msgSender: _msgSender(),
      msgValue: 0,
      target: address(module),
      callData: abi.encodeCall(IModule.install, (args))
    });

    // Register the module in the InstalledModules table
    InstalledModules._set(module.getName(), keccak256(args), address(module));
  }
}
