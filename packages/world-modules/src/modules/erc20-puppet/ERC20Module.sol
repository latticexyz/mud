// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { Module } from "@latticexyz/world/src/Module.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

import { Puppet } from "../puppet/Puppet.sol";
import { createPuppet } from "../puppet/createPuppet.sol";
import { Balances } from "../tokens/tables/Balances.sol";

import { MODULE_NAMESPACE, MODULE_NAMESPACE_ID, ERC20_REGISTRY_TABLE_ID } from "./constants.sol";
import { _allowancesTableId, _balancesTableId, _metadataTableId, _totalSupplyTableId, _erc20SystemId } from "./utils.sol";
import { ERC20System } from "./ERC20System.sol";

import { ERC20Registry } from "./tables/ERC20Registry.sol";
import { Allowances } from "./tables/Allowances.sol";
import { TotalSupply } from "./tables/TotalSupply.sol";
import { ERC20Metadata, ERC20MetadataData } from "./tables/ERC20Metadata.sol";

contract ERC20Module is Module {
  error ERC20Module_InvalidNamespace(bytes14 namespace);

  function install(bytes memory encodedArgs) public {
    // Require the module to not be installed with these args yet
    requireNotInstalled(__self, encodedArgs);

    // Decode args
    (bytes14 namespace, ERC20MetadataData memory metadata) = abi.decode(encodedArgs, (bytes14, ERC20MetadataData));

    // Require the namespace to not be the module's namespace
    if (namespace == MODULE_NAMESPACE) {
      revert ERC20Module_InvalidNamespace(namespace);
    }

    // Register the ERC20 tables and system
    IBaseWorld world = IBaseWorld(_world());
    ERC20ModuleRegistrationLib.register(world, namespace);

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
      world.registerNamespace(MODULE_NAMESPACE_ID);
      ERC20Registry.register(ERC20_REGISTRY_TABLE_ID);
    }
    ERC20Registry.set(ERC20_REGISTRY_TABLE_ID, namespaceId, puppet);
  }

  function installRoot(bytes memory) public pure {
    revert Module_RootInstallNotSupported();
  }
}

library ERC20ModuleRegistrationLib {
  /**
   * Register systems and tables for a new ERC20 token in a given namespace
   */
  function register(IBaseWorld world, bytes14 namespace) public {
    // Register the namespace if it doesn't exist yet
    ResourceId tokenNamespace = WorldResourceIdLib.encodeNamespace(namespace);
    world.registerNamespace(tokenNamespace);

    // Register the tables
    Allowances.register(_allowancesTableId(namespace));
    Balances.register(_balancesTableId(namespace));
    TotalSupply.register(_totalSupplyTableId(namespace));
    ERC20Metadata.register(_metadataTableId(namespace));

    // Register a new ERC20System
    world.registerSystem(_erc20SystemId(namespace), new ERC20System(), true);
  }
}
