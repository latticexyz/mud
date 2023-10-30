// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";

import { SystemSwitch } from "../../utils/SystemSwitch.sol";

import { ERC721Module } from "./ERC721Module.sol";
import { MODULE_NAMESPACE_ID, ERC721_REGISTRY_TABLE_ID } from "./constants.sol";
import { IERC721Mintable } from "./IERC721Mintable.sol";

import { ERC721MetadataData } from "./tables/ERC721Metadata.sol";
import { ERC721Registry } from "./tables/ERC721Registry.sol";

/**
 * @notice Register a new ERC721 token with the given metadata in a given namespace
 * @dev This function must be called within a Store context (i.e. using StoreSwitch.setStoreAddress())
 */
function registerERC721(
  IBaseWorld world,
  bytes14 namespace,
  ERC721MetadataData memory metadata
) returns (IERC721Mintable token) {
  // Get the ERC721 module
  ERC721Module erc721Module = ERC721Module(NamespaceOwner.get(MODULE_NAMESPACE_ID));
  if (address(erc721Module) == address(0)) {
    erc721Module = new ERC721Module();
  }

  // Install the ERC721 module with the provided args
  world.installModule(erc721Module, abi.encode(namespace, metadata));

  // Return the newly created ERC721 token
  token = IERC721Mintable(ERC721Registry.get(ERC721_REGISTRY_TABLE_ID, WorldResourceIdLib.encodeNamespace(namespace)));
}
