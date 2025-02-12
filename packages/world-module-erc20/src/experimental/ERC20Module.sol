// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";

import { Module } from "@latticexyz/world/src/Module.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { ERC20Registry } from "../codegen/tables/ERC20Registry.sol";
import { ERC20PausableBurnable } from "../examples/ERC20PausableBurnable.sol";
import { MUDERC20 } from "../experimental/MUDERC20.sol";
import { ModuleConstants, ERC20TableNames, PausableTableNames } from "./Constants.sol";

import { ERC20Metadata, ERC20MetadataData } from "../codegen/tables/ERC20Metadata.sol";
import { TotalSupply } from "../codegen/tables/TotalSupply.sol";
import { Balances } from "../codegen/tables/Balances.sol";
import { Allowances } from "../codegen/tables/Allowances.sol";
import { Paused } from "../codegen/tables/Paused.sol";

contract ERC20Module is Module {
  error ERC20Module_InvalidNamespace(bytes14 namespace);
  error ERC20Module_NamespaceAlreadyExists(bytes14 namespace);

  function install(bytes memory encodedArgs) public override {
    // TODO: we should probably check just for namespace, not for all args
    requireNotInstalled(__self, encodedArgs);

    (bytes14 namespace, bytes16 systemName, string memory name, string memory symbol) = abi.decode(
      encodedArgs,
      (bytes14, bytes16, string, string)
    );

    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
    ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, namespace, systemName);

    // Require the namespace to not be the module's namespace
    if (namespace == ModuleConstants.NAMESPACE) {
      revert ERC20Module_InvalidNamespace(namespace);
    } else if (ResourceIds.getExists(namespaceId)) {
      revert ERC20Module_NamespaceAlreadyExists(namespace);
    }

    IBaseWorld world = IBaseWorld(_world());

    world.registerNamespace(namespaceId);

    ERC20PausableBurnable token = ERC20ModuleLib.deployAndRegisterTables(world, namespace);

    // Grant access to the token so it can register and write to tables after transferring ownership
    world.grantAccess(namespaceId, address(token));

    // Register token as a system so its functions can be called through the world
    world.registerSystem(systemId, token, true);

    // Set metadata and paused state by calling initialize (onlyNamespaceOwner)
    world.call(systemId, abi.encodeCall(ERC20PausableBurnable.initialize, (name, symbol)));

    ERC20ModuleLib.registerToken(world, namespaceId, address(token));

    world.transferOwnership(namespaceId, _msgSender());
  }
}

library ERC20ModuleLib {
  function deployAndRegisterTables(IBaseWorld world, bytes14 namespace) public returns (ERC20PausableBurnable) {
    ResourceId totalSupplyId = WorldResourceIdLib.encode(RESOURCE_TABLE, namespace, ERC20TableNames.TOTAL_SUPPLY);
    ResourceId balancesId = WorldResourceIdLib.encode(RESOURCE_TABLE, namespace, ERC20TableNames.BALANCES);
    ResourceId allowancesId = WorldResourceIdLib.encode(RESOURCE_TABLE, namespace, ERC20TableNames.ALLOWANCES);
    ResourceId metadataId = WorldResourceIdLib.encode(RESOURCE_TABLE, namespace, ERC20TableNames.METADATA);
    ResourceId pausedId = WorldResourceIdLib.encode(RESOURCE_TABLE, namespace, PausableTableNames.PAUSED);

    // Register each table
    TotalSupply.register(totalSupplyId);
    Balances.register(balancesId);
    Allowances.register(allowancesId);
    ERC20Metadata.register(metadataId);
    Paused.register(pausedId);

    return new ERC20PausableBurnable(world, namespace, totalSupplyId, balancesId, allowancesId, metadataId, pausedId);
  }

  function registerToken(IBaseWorld world, ResourceId namespaceId, address token) public {
    ResourceId erc20RegistryTableId = ModuleConstants.registryTableId();
    if (!ResourceIds.getExists(erc20RegistryTableId)) {
      world.registerNamespace(ModuleConstants.namespaceId());
      ERC20Registry.register(erc20RegistryTableId);
    }
    // Register the ERC20 in the ERC20Registry
    ERC20Registry.set(erc20RegistryTableId, namespaceId, address(token));
  }
}
