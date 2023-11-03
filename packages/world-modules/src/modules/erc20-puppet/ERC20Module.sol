// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { Module } from "@latticexyz/world/src/Module.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { InstalledModules } from "@latticexyz/world/src/codegen/tables/InstalledModules.sol";

import { Puppet } from "../puppet/Puppet.sol";
import { createPuppet } from "../puppet/createPuppet.sol";
import { MODULE_NAME as PUPPET_MODULE_NAME } from "../puppet/constants.sol";
import { Balances } from "../tokens/tables/Balances.sol";

import { MODULE_NAME, MODULE_NAMESPACE, MODULE_NAMESPACE_ID, ERC20_REGISTRY_TABLE_ID } from "./constants.sol";
import { _allowancesTableId, _balancesTableId, _metadataTableId, _erc20SystemId } from "./utils.sol";
import { ERC20System } from "./ERC20System.sol";

import { ERC20Registry } from "./tables/ERC20Registry.sol";
import { Allowances } from "./tables/Allowances.sol";
import { ERC20Metadata, ERC20MetadataData } from "./tables/ERC20Metadata.sol";

contract ERC20Module is Module {
  error ERC20Module_InvalidNamespace(bytes14 namespace);

  address immutable registrationLibrary = address(new ERC20ModuleRegistrationLibrary());

  function getName() public pure override returns (bytes16) {
    return MODULE_NAME;
  }

  function _requireDependencies() internal view {
    // Require PuppetModule to be installed
    if (InstalledModules.get(PUPPET_MODULE_NAME, keccak256(new bytes(0))) == address(0)) {
      revert Module_MissingDependency(string(bytes.concat(PUPPET_MODULE_NAME)));
    }
  }

  function install(bytes memory args) public {
    // Require the module to not be installed with these args yet
    if (InstalledModules.get(MODULE_NAME, keccak256(args)) != address(0)) {
      revert Module_AlreadyInstalled();
    }

    // Extract args
    (bytes14 namespace, ERC20MetadataData memory metadata) = abi.decode(args, (bytes14, ERC20MetadataData));

    // Require the namespace to not be the module's namespace
    if (namespace == MODULE_NAMESPACE) {
      revert ERC20Module_InvalidNamespace(namespace);
    }

    // Require dependencies
    _requireDependencies();

    // Register the ERC20 tables and system
    IBaseWorld world = IBaseWorld(_world());
    registrationLibrary.delegatecall(abi.encodeCall(ERC20ModuleRegistrationLibrary.register, (world, namespace)));

    // Initialize the Metadata
    ERC20Metadata.set(_metadataTableId(namespace), metadata);

    // Deploy and register the ERC20 puppet.
    ResourceId erc20SystemId = _erc20SystemId(namespace);
    address puppet = createPuppet(world, erc20SystemId);

    // Transfer ownership of the namespace to the caller
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
    world.transferOwnership(namespaceId, _msgSender());

    // Register the ERC20 in the ERC20Registry
    if (!ResourceIds.getExists(ERC20_REGISTRY_TABLE_ID)) {
      ERC20Registry.register(ERC20_REGISTRY_TABLE_ID);
    }
    ERC20Registry.set(ERC20_REGISTRY_TABLE_ID, namespaceId, puppet);
  }

  function installRoot(bytes memory) public pure {
    revert Module_RootInstallNotSupported();
  }
}

contract ERC20ModuleRegistrationLibrary {
  /**
   * Register systems and tables for a new ERC20 token in a given namespace
   */
  function register(IBaseWorld world, bytes14 namespace) public {
    // Register the tables
    Allowances.register(_allowancesTableId(namespace));
    Balances.register(_balancesTableId(namespace));
    ERC20Metadata.register(_metadataTableId(namespace));

    // Register a new ERC20System
    world.registerSystem(_erc20SystemId(namespace), new ERC20System(), true);
  }
}
