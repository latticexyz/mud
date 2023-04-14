// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IModule } from "../../../interfaces/IModule.sol";
import { System } from "../../../System.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { Call } from "../../../Call.sol";
import { ResourceAccess } from "../../../tables/ResourceAccess.sol";
import { InstalledModules } from "../../../tables/InstalledModules.sol";

/**
 * Installation of (non-root) modules in the World.
 */
contract ModuleInstallationSystem is System {
  /**
   * Install the given module at the given namespace in the World.
   */
  function installModule(IModule module, bytes memory args) public {
    Call.withSender({
      msgSender: _msgSender(),
      target: address(module),
      funcSelectorAndArgs: abi.encodeWithSelector(IModule.install.selector, args),
      delegate: false,
      value: 0
    });

    // Register the module in the InstalledModules table
    InstalledModules.set(module.getName(), keccak256(args), address(module));
  }
}
