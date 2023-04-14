// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IModule } from "../../interfaces/IModule.sol";

import { System } from "../../System.sol";
import { AccessControl } from "../../AccessControl.sol";
import { Call } from "../../Call.sol";

import { ResourceAccess } from "../../tables/ResourceAccess.sol";
import { InstalledModules } from "../../tables/InstalledModules.sol";

/**
 * World methods that aren't hot code paths.
 */
contract ColdMethodsSystem is System {
  /**
   * Install the given module at the given namespace in the World.
   */
  function installModule(IModule module, bytes memory args) public {
    Call.withSender({
      msgSender: msg.sender,
      target: address(module),
      funcSelectorAndArgs: abi.encodeWithSelector(IModule.install.selector, args),
      delegate: false,
      value: 0
    });

    // Register the module in the InstalledModules table
    InstalledModules.set(module.getName(), keccak256(args), address(module));
  }

  /************************************************************************
   *
   *    WORLD ACCESS METHODS
   *
   ************************************************************************/

  /**
   * Grant access to the resource at the given namespace and name.
   * Requires the caller to own the namespace.
   */
  function grantAccess(bytes16 namespace, bytes16 name, address grantee) public virtual {
    // Require the caller to own the namespace
    bytes32 resourceSelector = AccessControl.requireOwnerOrSelf(namespace, name, msg.sender);

    // Grant access to the given resource
    ResourceAccess.set(resourceSelector, grantee, true);
  }

  /**
   * Retract access from the resource at the given namespace and name.
   */
  function retractAccess(bytes16 namespace, bytes16 name, address grantee) public virtual {
    // Require the caller to own the namespace
    bytes32 resourceSelector = AccessControl.requireOwnerOrSelf(namespace, name, msg.sender);

    // Retract access from the given resource
    ResourceAccess.deleteRecord(resourceSelector, grantee);
  }
}
