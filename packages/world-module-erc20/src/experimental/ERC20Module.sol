// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { Module } from "@latticexyz/world/src/Module.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

import { ERC20Registry } from "../codegen/tables/ERC20Registry.sol";
import { ERC20PausableBurnable } from "../examples/ERC20PausableBurnable.sol";
import { ModuleConstants } from "./Constants.sol";

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

    ERC20PausableBurnable token = new ERC20PausableBurnable(world, namespace, name, symbol);

    // Grant access to the token so it can write to tables after transferring ownership
    world.grantAccess(namespaceId, address(token));

    // Register token as a system so its functions can be called through the world
    world.registerSystem(systemId, token, true);

    // The token should have transferred the namespace ownership to this module in its constructor
    world.transferOwnership(namespaceId, _msgSender());

    ERC20RegistryLib.register(world, namespaceId, address(token));
  }
}

library ERC20RegistryLib {
  function register(IBaseWorld world, ResourceId namespaceId, address token) public {
    ResourceId erc20RegistryTableId = ModuleConstants.registryTableId();
    if (!ResourceIds.getExists(erc20RegistryTableId)) {
      world.registerNamespace(ModuleConstants.namespaceId());
      ERC20Registry.register(erc20RegistryTableId);
    }
    // Register the ERC20 in the ERC20Registry
    ERC20Registry.set(erc20RegistryTableId, namespaceId, address(token));
  }
}
