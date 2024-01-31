// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { Module } from "@latticexyz/world/src/Module.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { InstalledModules } from "@latticexyz/world/src/codegen/tables/InstalledModules.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

import { Puppet } from "../puppet/Puppet.sol";
import { createPuppet } from "../puppet/createPuppet.sol";
import { Balances } from "../tokens/tables/Balances.sol";

import { MODULE_NAMESPACE, MODULE_NAMESPACE_ID, ERC1155_REGISTRY_TABLE_ID } from "./constants.sol";
import { _erc1155SystemId, _tokenUriTableId, _balancesTableId, _metadataTableId, _operatorApprovalTableId } from "./utils.sol";
import { ERC1155System } from "./ERC1155System.sol";

import { ERC1155Balances } from "./tables/ERC1155Balances.sol";
import { TokenOperatorApproval } from "../tokens/tables/TokenOperatorApproval.sol";
import { TokenURIStorage } from "../tokens/tables/TokenURIStorage.sol";
import { TokenRegistry } from "../tokens/tables/TokenRegistry.sol";
import { TokenMetadata, TokenMetadataData } from "../tokens/tables/TokenMetadata.sol";

contract ERC1155Module is Module {
  error ERC1155Module_InvalidNamespace(bytes14 namespace);

  address immutable registrationLibrary = address(new ERC1155ModuleRegistrationLibrary());

  function install(bytes memory encodedArgs) public {
    // Require the module to not be installed with these args yet
    requireNotInstalled(__self, encodedArgs);

    // Extract args
    (bytes14 namespace, TokenMetadataData memory metadata) = abi.decode(encodedArgs, (bytes14, TokenMetadataData));

    // Require the namespace to not be the module's namespace
    if (namespace == MODULE_NAMESPACE) {
      revert ERC1155Module_InvalidNamespace(namespace);
    }

    // Register the ERC1155 tables and system
    IBaseWorld world = IBaseWorld(_world());
    (bool success, bytes memory returnData) = registrationLibrary.delegatecall(
      abi.encodeCall(ERC1155ModuleRegistrationLibrary.register, (world, namespace))
    );
    if (!success) revertWithBytes(returnData);

    // Initialize the Metadata
    TokenMetadata.set(_metadataTableId(namespace), metadata);

    // Deploy and register the ERC1155 puppet.
    ResourceId erc1155SystemId = _erc1155SystemId(namespace);
    address puppet = createPuppet(world, erc1155SystemId);

    // Transfer ownership of the namespace to the caller
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
    world.transferOwnership(namespaceId, _msgSender());

    // Register the ERC1155 in the ERC20Registry
    if (!ResourceIds.getExists(ERC1155_REGISTRY_TABLE_ID)) {
      world.registerNamespace(MODULE_NAMESPACE_ID);
      TokenRegistry.register(ERC1155_REGISTRY_TABLE_ID);
    }
    TokenRegistry.set(ERC1155_REGISTRY_TABLE_ID, namespaceId, puppet);
  }

  function installRoot(bytes memory) public pure {
    revert Module_RootInstallNotSupported();
  }
}

contract ERC1155ModuleRegistrationLibrary {
  /**
   * Register systems and tables for a new ERC1155 token in a given namespace
   */
  function register(IBaseWorld world, bytes14 namespace) public {
    // Register the namespace if it doesn't exist yet
    ResourceId tokenNamespace = WorldResourceIdLib.encodeNamespace(namespace);
    if (!ResourceIds.getExists(tokenNamespace)) {
      world.registerNamespace(tokenNamespace);
    }

    // Register the tables
    TokenURIStorage.register(_tokenUriTableId(namespace));
    ERC1155Balances.register(_balancesTableId(namespace));
    TokenMetadata.register(_metadataTableId(namespace));
    TokenOperatorApproval.register(_operatorApprovalTableId(namespace));

    // Register a new ERC20System
    world.registerSystem(_erc1155SystemId(namespace), new ERC1155System(), true);
  }
}
