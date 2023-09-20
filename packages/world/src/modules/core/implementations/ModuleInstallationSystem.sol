// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IModule, MODULE_INTERFACE_ID } from "../../../interfaces/IModule.sol";
import { System } from "../../../System.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { WorldContextProvider } from "../../../WorldContext.sol";
import { ResourceAccess } from "../../../tables/ResourceAccess.sol";
import { InstalledModules } from "../../../tables/InstalledModules.sol";
import { requireInterface } from "../../../requireInterface.sol";

/**
 * Installation of (non-root) modules in the World.
 */
contract ModuleInstallationSystem is System {
  /**
   * Install the given module at the given namespace in the World.
   */
  function installModule(IModule module, bytes memory args) public {
    // Require the provided address to implement the IModule interface
    requireInterface(address(module), MODULE_INTERFACE_ID);

    WorldContextProvider.callWithContextOrRevert({
      msgSender: _msgSender(),
      msgValue: 0,
      target: address(module),
      callData: abi.encodeCall(IModule.install, (args))
    });

    // Register the module in the InstalledModules table
    InstalledModules._set(module.getName(), keccak256(args), address(module));
  }
}
