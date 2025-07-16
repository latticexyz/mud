// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IModule } from "../../../IModule.sol";
import { System } from "../../../System.sol";
import { WorldContextProviderLib } from "../../../WorldContext.sol";
import { InstalledModules } from "../../../codegen/tables/InstalledModules.sol";
import { requireInterface } from "../../../requireInterface.sol";

import { LimitedCallContext } from "../LimitedCallContext.sol";

/**
 * @title Module Installation System
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev A system contract to handle the installation of (non-root) modules in the World.
 */
abstract contract ModuleInstallationSystem is System, LimitedCallContext {
  /**
   * @notice Installs a module into the World under a specified namespace.
   * @dev Validates the given module against the IModule interface and delegates the installation process.
   * The module is then registered in the InstalledModules table.
   * @param module The module to be installed.
   * @param encodedArgs The ABI encoded arguments for module installation.
   */
  function installModule(IModule module, bytes memory encodedArgs) public onlyDelegatecall {
    // Require the provided address to implement the IModule interface
    requireInterface(address(module), type(IModule).interfaceId);

    WorldContextProviderLib.callWithContextOrRevert({
      msgSender: _msgSender(),
      msgValue: 0,
      target: address(module),
      callData: abi.encodeCall(IModule.install, (encodedArgs))
    });

    // Register the module in the InstalledModules table
    InstalledModules._set(address(module), keccak256(encodedArgs), true);
  }
}
