// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";

import { Module } from "@latticexyz/world/src/Module.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

import { ERC20Registry } from "./codegen/tables/ERC20Registry.sol";
import { ERC20WithNamespace } from "./examples/ERC20WithNamespace.sol";
import { ModuleConstants } from "./Constants.sol";

contract ERC20Module is Module {
  error ERC20Module_InvalidNamespace(bytes14 namespace);
  error ERC20Module_NamespaceAlreadyExists(bytes14 namespace);

  function install(bytes memory encodedArgs) public {
    // TODO: we should probably check just for namespace, not for all args
    requireNotInstalled(__self, encodedArgs);

    (bytes14 namespace, string memory name, string memory symbol) = abi.decode(encodedArgs, (bytes14, string, string));

    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);

    // Require the namespace to not be the module's namespace
    if (namespace == ModuleConstants.NAMESPACE) {
      revert ERC20Module_InvalidNamespace(namespace);
    } else if (ResourceIds.getExists(namespaceId)) {
      revert ERC20Module_NamespaceAlreadyExists(namespace);
    }

    ResourceId moduleNamespaceId = WorldResourceIdLib.encodeNamespace(ModuleConstants.NAMESPACE);
    ResourceId erc20RegistryTableId = WorldResourceIdLib.encode(
      RESOURCE_TABLE,
      ModuleConstants.NAMESPACE,
      ModuleConstants.REGISTRY_TABLE_NAME
    );

    IBaseWorld world = IBaseWorld(_world());

    ERC20WithNamespace token = new ERC20WithNamespace(world, namespace, name, symbol);

    // Register the ERC20 in the ERC20Registry
    if (!ResourceIds.getExists(erc20RegistryTableId)) {
      world.registerNamespace(moduleNamespaceId);
      ERC20Registry.register(erc20RegistryTableId);
    }

    ERC20Registry.set(erc20RegistryTableId, namespaceId, address(token));

    // The token should have transferred the namespace ownership to this module in its constructor
    world.transferOwnership(namespaceId, _msgSender());
  }

  function installRoot(bytes memory) public pure {
    revert Module_RootInstallNotSupported();
  }
}
