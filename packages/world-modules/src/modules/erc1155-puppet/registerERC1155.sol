// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";

import { ERC1155Module } from "./ERC1155Module.sol";
import { MODULE_NAMESPACE_ID, ERC1155_REGISTRY_TABLE_ID } from "./constants.sol";
import { IERC1155Mintable } from "./IERC1155Mintable.sol";

import { TokenMetadataData } from "../tokens/tables/TokenMetadata.sol";
import { TokenRegistry } from "../tokens//tables/TokenRegistry.sol";

/**
 * @notice Register a new ERC1155 token with the given metadata in a given namespace
 * @dev This function must be called within a Store context (i.e. using StoreSwitch.setStoreAddress())
 */
function registerERC1155(
  IBaseWorld world,
  bytes14 namespace,
  TokenMetadataData memory metadata
) returns (IERC1155Mintable token) {
  // Get the ERC1155 module
  ERC1155Module erc1155Module = ERC1155Module(NamespaceOwner.get(MODULE_NAMESPACE_ID));
  if (address(erc1155Module) == address(0)) {
    erc1155Module = new ERC1155Module();
  }

  // Install the ERC1155 module with the provided args
  world.installModule(erc1155Module, abi.encode(namespace, metadata));

  // Return the newly created ERC1155 token
  token = IERC1155Mintable(TokenRegistry.get(ERC1155_REGISTRY_TABLE_ID, WorldResourceIdLib.encodeNamespace(namespace)));
}
