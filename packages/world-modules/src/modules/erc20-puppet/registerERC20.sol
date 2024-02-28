// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";

import { ERC20Module } from "./ERC20Module.sol";
import { MODULE_NAMESPACE_ID, ERC20_REGISTRY_TABLE_ID } from "./constants.sol";
import { IERC20Mintable } from "./IERC20Mintable.sol";

import { ERC20MetadataData } from "./tables/ERC20Metadata.sol";
import { ERC20Registry } from "./tables/ERC20Registry.sol";

/**
 * @notice Register a new ERC20 token with the given metadata in a given namespace
 * @dev This function must be called within a Store context (i.e. using StoreSwitch.setStoreAddress())
 */
function registerERC20(
  IBaseWorld world,
  bytes14 namespace,
  ERC20MetadataData memory metadata
) returns (IERC20Mintable token) {
  // Get the ERC20 module
  ERC20Module erc20Module = ERC20Module(NamespaceOwner.get(MODULE_NAMESPACE_ID));
  if (address(erc20Module) == address(0)) {
    erc20Module = new ERC20Module();
  }

  // Register the namespace if it doesn't exist yet
  ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
  if (!ResourceIds.getExists(namespaceId)) {
    world.registerNamespace(namespaceId);
  }
  world.transferOwnership(namespaceId, address(erc20Module));

  // Install the ERC20 module with the provided args
  world.installModule(erc20Module, abi.encode(namespace, metadata));

  // Return the newly created ERC20 token
  token = IERC20Mintable(ERC20Registry.get(ERC20_REGISTRY_TABLE_ID, WorldResourceIdLib.encodeNamespace(namespace)));
}
